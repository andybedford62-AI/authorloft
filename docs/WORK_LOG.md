# AuthorLoft — Work Log

Dated record of work completed on AuthorLoft, newest first. Unlike `docs/CHANGELOG.md`
(the product/engineering record of what shipped), this file is written so it can back an
invoice or a status report: each date lists the deliverables, the commits that contain
them, and what was done outside the codebase.

**Billing fields are intentionally blank.** Hours, rate and amount are never guessed —
fill them in per date when invoicing. Commit timestamps are recorded as evidence of when
work happened, not as a measure of time spent.

**How to maintain:** at the end of every working session, add (or extend) that date's
entry. Group by deliverable, cite commit hashes, note database/infra changes and anything
the client did themselves, and list what is still pending. Keep `docs/CHANGELOG.md` in
sync — it holds the technical detail, this file holds the accounting view.

Entry template:

```
## <Month D, YYYY>
**Hours:** ____  **Rate:** ____  **Amount:** ____  **Invoice #:** ____

### <Deliverable>
- what was delivered (1–3 lines)
- Commits: `abc1234`, …

### Database / infrastructure
### Done outside the codebase
### Pending / follow-ups
```

---

## September 29, 2026 — Legal & compliance pass, plan-downgrade grace period

**Hours:** ____  **Rate:** ____  **Amount:** ____  **Invoice #:** ____

Seven commits on `dev` between 09:12 and 11:21 (local time), plus review, research and
analysis work that did not produce a commit. Work began with a review of a checklist of six
common legal risks for AI-built apps against the AuthorLoft codebase.

### 1. Legal-risk audit and quick fixes
- Audited the codebase against all six checklist items. Findings: age check (already
  present — 18+ confirmation at signup), fonts (already self-hosted, one leftover Google
  preconnect), session replay (PostHog off; Sentry error-triggered replay found), email
  compliance (unsubscribe present, postal address missing), renewal terms (missing at
  checkout), DMCA agent (missing).
- Removed the leftover `fonts.gstatic.com` preconnect so fonts are fully self-hosted.
- Added auto-renewal terms beside the Subscribe button on Stripe plan checkout.
- Added the postal address to the shared platform email footer (CAN-SPAM).
- Commits: `1344b1fe`, `82bea19f`

### 2. DMCA / copyright compliance
- Advised on DMCA safe-harbor requirements; the client registered the designated agent with
  the U.S. Copyright Office (DMCA-1081407, Anthony P Bedford LLC, dmca@authorloft.com).
- Built the public `/dmca` Copyright & DMCA Policy page: takedown notice requirements,
  counter-notice process, repeat-infringer policy, agent details matching the registration.
- Linked from the marketing footer and author-site footers; added to the sitemap, robots
  allow list and `llms-full.txt`.
- Commits: `321aa6a1`

### 3. Terms of Service rewrite
- Reviewed the live Terms (database-stored, last edited March 31, 2026) against the code
  default and against actual product behavior; found contradictions with the pricing pages.
- Rewrote the Terms: operator identified, 18+ requirement, renewal wording, IP ownership
  warranty, DMCA section, newsletter compliance (CAN-SPAM / GDPR) responsibility, Alabama
  governing law with Shelby County venue, corrected refund and cancellation terms.
- Delivered a paste-ready text file for the Super Admin Legal editor.
- Commits: `9852beea`, later revised in `101389df`

### 4. Privacy Policy rewrite and consent fix
- Reviewed the live Privacy Policy (contained company-name typos and was materially out of
  date) against what the site actually collects and which processors receive data.
- Rewrote it: operator and contact, author-vs-reader data roles, cookies and analytics
  detail, Sentry masked error replay, AI (Gemini) disclosure, full processor list,
  international transfers, retention, 18+ and under-13 handling, U.S. state rights.
- Updated `/gdpr` and `/us-privacy` to match and fixed a retention conflict between them
  and the Terms; standardized the privacy contact on privacy@authorloft.com.
- Fixed the Google tag: it loaded before consent with no default; added a Consent Mode
  default (all denied until the visitor accepts; returning accepted visitors handled).
- Commits: `34e3085b`

### 5. Refund / cancellation / retention policy alignment
- Audited every place the policy is stated (Terms, pricing pages, homepage, pricing FAQ,
  database FAQ, checkout, GDPR, Privacy) and found several that contradicted each other
  and the product.
- Defined one policy: 30-day money-back guarantee on the first paid payment (monthly or
  annual), refund moves the account to Free with nothing deleted, non-refundable after 30
  days including annual, cancel anytime to Free with the site staying live.
- Applied it to the Terms, Privacy, `/gdpr`, `/us-privacy`, homepage and pricing footers,
  the pricing FAQ (four answers corrected) and the Stripe checkout note (adds the refund
  and annual no-refund line). Delivered paste-ready text for the Terms, Privacy and the
  database-stored homepage FAQ.
- Commits: `101389df`

### 6. Plan-downgrade grace period (new feature)
- Finding: cancelling or downgrading left over-limit content live indefinitely, custom
  domains kept working after cancellation, and the Free storage limit is displayed but
  unenforced.
- Built a 30-day grace period: on downgrade or cancellation the author is emailed (start,
  ~day 14, ~day 27, and when applied) and sees a dashboard notice; after the deadline,
  content beyond the plan's limits (books, courses, music lists, posts, flip books) is
  unpublished — never deleted — and restored automatically on upgrade up to the new
  limits; a custom domain the plan no longer includes redirects to the free subdomain.
- Runs from a new daily cron (`/api/cron/plan-grace`, supports `?dryRun=1`) and
  immediately from the Stripe webhook on cancel, downgrade and upgrade.
- 21 unit tests added. Checked against live data first: none of the 13 authors was over a
  limit, so rollout hides nothing.
- Commits: `6bff2f6e`

### Database / infrastructure
- Migration `20260929_plan_downgrade_grace` applied to Supabase (7 nullable/defaulted
  columns on `Author`, `Book`, `Course`, `Post`, `FlipBook`; no new tables) and saved in
  `prisma/migrations/`. Additive only.
- New Vercel cron registered: `/api/cron/plan-grace`, daily 05:30 UTC.
- DNS review of `authorloft.com` (read-only): MX/SPF already on ImprovMX, outbound on
  Resend via `send.authorloft.com`, DMARC monitor-only. No changes needed.
- Email options advised: ImprovMX for inbound aliases, Resend for outbound, Gmail
  "Send mail as" via Resend SMTP; Resend free tier vs. paid vs. SES.

### Done outside the codebase (by the client)
- Registered the DMCA designated agent with the U.S. Copyright Office ($6 fee paid by the
  client).
- Promoted the legal/compliance changes (through `34e3085b`) to production, then the grace
  period and aligned wording (`6bff2f6e`, `101389df`).
- Client reported the remaining launch steps complete and everything live in production:
  created the `privacy@authorloft.com` alias, pasted the new Terms, Privacy and FAQ text
  into the live editors, tested `dmca@` and `privacy@` delivery, and had the wording
  reviewed. (Recorded as reported by the client; not independently verified.)

### Documentation updated
- `docs/CHANGELOG.md`, `docs/FEATURE_BACKLOG.md` (new "Legal & Compliance" section),
  and project memory notes for future sessions.

### Pending / follow-ups
- Test the grace period end to end on a throwaway author (deferred by the client; not yet
  run live — only unit tests and a database column check so far).
- Backlog: enforce plan storage limits on upload; inactivity clean-up policy; optional
  consent-gating of Sentry replay; author "keep live" picker; annual no-refund
  acknowledgement beyond the checkout line; DMCA renewal due September 2029.
