# AuthorLoft — Planning Decision Log
**Date:** April 3, 2026
**Status:** Discussion complete — ready for development planning

---

## TOPIC 1: Flip Books (Selling / Downloads)

**Decision: No flip book sales — deferred indefinitely.**

- The downloadable format (ZIP + HTML + EXE launcher) is too complex for typical readers.
- eBooks (PDF, ePub) already meet the need for downloadable digital content.
- Authors can already provide an external flip book link (Issuu, FlipHTML5, etc.) which is displayed/embedded through their AuthorLoft author site — this is already handled and requires no new work.
- **Revisit when:** A universal flip book file format with native OS support emerges (similar to ePub for eBooks).

---

## TOPIC 2: Subscription Management (Upgrade / Downgrade)

### 2.1 How Authors Manage Their Plan

- A **"My Plan" / "Billing"** page in the author admin panel displays the three plan options with descriptions.
- A **"Change Subscription"** button launches the **Stripe Customer Portal** — Stripe handles all upgrade, downgrade, cancellation, payment method changes, and invoice history.
- No custom-built billing UI needed — Stripe Customer Portal is the solution.
- The "My Plan" link should appear prominently in the admin sidebar, plus a subtle plan badge/nudge on the dashboard (e.g., *"You're on Standard — Upgrade to Premium"*).

---

### 2.2 Billing — Monthly & Annual

- Both **monthly and annual billing** are offered.
- Annual billing is offered at approximately **20% off** the monthly equivalent.
- **Exact pricing is set and managed by Super Admin** in the platform settings — not hardcoded anywhere.
- Annual subscribers must check an **explicit acknowledgment checkbox** at checkout:
  > *"I understand this plan is non-refundable."*
- This checkbox protects against chargebacks and sets clear expectations.

---

### 2.3 Refund Policy

- **30-day money-back guarantee** — applies to the **first paid subscription payment only** (not renewals, not plan upgrades between paid tiers).
- To request a refund, the subscriber must **contact AuthorLoft support**. Refunds are not self-serve through Stripe portal.
- Super Admin reviews the request and processes the refund manually via Stripe.
- If a refund is issued (within 30 days): **all account data and content is permanently and immediately deleted** — no archive period, no restoration.
- After 30 days from initial subscription: **no refunds under any circumstances**, including downgrades, cancellations, and annual plan cancellations.
- This policy must be clearly stated:
  - In the Terms of Service.
  - On the plan/pricing page.
  - At the annual billing checkout (via checkbox — see 2.2).
- The marketing page tagline *"30-day money-back guarantee"* and the FAQ answer referencing it are **consistent with this policy and should remain**.

---

### 2.4 Plan Downgrades

- Downgrades take effect at the **end of the current billing cycle** — the author retains full current-plan access until then.
- The app must track **both** the current plan and the scheduled next plan, with the effective change date.
- No refund is issued for the remaining period on the higher-tier plan.

---

### 2.5 Plan Upgrades

- Upgrades take effect **immediately**.
- Stripe handles prorating for mid-cycle upgrades automatically.

---

### 2.6 Failed Payments & Account Lockdown

- Follow **Stripe's retry logic** (typically ~8 days of retries).
- On **Day 9** (after Stripe's final retry fails), the account is **automatically restricted** ("locked down") via webhook.
- This is webhook-driven and automatic — no manual trigger required.
- During the retry window (Days 1–8), the author receives **warning emails** notifying them of the payment issue.
- **What "locked down" means:**
  - The author's public-facing site and premium features are restricted.
  - The author can still **log in** to their admin panel to update their payment method.
  - To **unrestrict** the account, the author must contact AuthorLoft support and provide **proof of payment**.
  - Super Admin then manually unrestricts the account via the override functionality.
- **Super Admin is notified** when an account is locked: dashboard indicator + email alert.
- The **grace period (7–9 days)** must be clearly stated in the Terms of Service.

---

### 2.7 Content Archival Policy

- When a subscriber **downgrades**, any content exceeding the lower plan's limits (e.g., books over the cap, custom domain) is **archived — not deleted**.
- When a subscriber **cancels**, all content is archived for a period defined by their previous plan tier (see 2.8).
- **Nothing is deleted** unless the archive retention period expires with no reactivation.
- Upon **resubscription**, all archived content is **fully restored** automatically.
- This restoration offer should be prominently stated on the cancellation confirmation screen as a retention message.

---

### 2.8 Archive Retention Periods (Tiered by Plan)

- Retention period **varies by the plan the subscriber held at the time of cancellation**.
- Retention periods are **configurable by Super Admin** in platform settings — not hardcoded in code.
- The Terms of Service will reference the retention period generically:
  > *"Cancelled accounts are archived for a period of time as specified on our Pricing and Plans page."*
- The Pricing and Plans page dynamically displays whatever the Super Admin has currently set.
- **Suggested defaults (to be set by Super Admin at launch):**

  | Plan at Cancellation | Suggested Retention |
  |---|---|
  | Free | 30 days |
  | Standard | 60 days |
  | Premium | 90 days |

- After the retention period expires with no reactivation, the account and all content are permanently deleted.

---

### 2.9 Two Cancellation Code Paths

**Path 1 — Within 30 days of initial subscription:**
- Author contacts support → Super Admin reviews → Super Admin issues refund via Stripe API
- Account and ALL data permanently and immediately deleted (no archive, no retention period)
- Refund confirmation email sent to author

**Path 2 — After 30 days:**
- No refund issued
- Account remains active until end of current billing cycle
- Content then archived per tier retention period (as per section 2.7 / 2.8)
- Standard archive/restoration policy applies

### 2.10 Database Fields Required (per Author/Subscriber record)

| Field | Purpose |
|---|---|
| `currentPlan` | Active plan (Free, Standard, Premium) |
| `initialSubscriptionDate` | Date of first ever paid subscription (used for 30-day refund window) |
| `planStartDate` | When the current plan began |
| `scheduledNextPlan` | Plan to take effect at next billing cycle (if changing) |
| `scheduledChangeDate` | When the plan change takes effect |
| `billingCadence` | Monthly or Annual |
| `stripeCustomerId` | Stripe customer reference |
| `stripeSubscriptionId` | Stripe subscription reference |
| `paymentStatus` | Active, Failed, Restricted, Cancelled |
| `restrictedAt` | Timestamp when account was locked down |
| `archivedAt` | Timestamp when account entered archive state |
| `archiveExpiresAt` | Calculated from plan tier retention setting |

---

### 2.11 Super Admin Capabilities Required

- View per-author: current plan, plan start date, scheduled change, effective date, payment status, Stripe IDs.
- Dashboard indicator + email alert when any account is restricted (failed payment).
- **Manual override** — ability to unrestrict an account after proof of payment is confirmed.
- **Refund processing** — ability to trigger a Stripe refund for a subscriber within their 30-day window, with confirmation prompt showing the subscription start date and refund amount. Triggering a refund initiates immediate permanent account deletion.
- **Configurable settings** in platform settings:
  - Archive retention period per plan tier (Free / Standard / Premium).
  - Annual billing discount percentage.
  - (Pricing amounts already managed by Super Admin.)

---

### 2.12 Notification Emails Required (via AWS SES)

| Trigger | Recipient | Purpose |
|---|---|---|
| Plan upgraded | Author | Confirmation of plan change |
| Downgrade scheduled | Author | Confirmation + what changes at cycle end |
| Downgrade approaching | Author | Reminder a few days before effective date |
| Approaching plan limit | Author | Warning (e.g., 4 of 5 books used on Free) |
| Payment failed (Day 1) | Author | First warning — update payment method |
| Payment still failing (Day 5–6) | Author | Urgent warning — account at risk |
| Account restricted (Day 9) | Author | Locked down — contact support |
| Account restricted (Day 9) | Super Admin | Alert — account needs attention |
| Cancellation confirmed (>30 days) | Author | Content is safely archived + resubscribe message |
| Refund approved (<30 days) | Author | Refund confirmed + account deletion notice |
| Archive expiry approaching | Author | Warning — content will be deleted soon |

---

## TOPIC 3: Terms of Service Updates

**Decision: Update the existing Terms of Service — do not replace or create a supplement.**

- The existing ToS lives at `/terms` and is managed via the Super Admin legal editor.
- The default content is in `src/lib/legal-defaults.ts`.

### Sections to REWRITE in existing Terms:

**"Subscriptions and Billing"** — complete rewrite to include:
- Monthly and annual billing options.
- Annual discount (as set on Pricing page).
- Explicit no-refund policy for both monthly and annual.
- Auto-renewal disclosure.
- Reference to annual checkout acknowledgment checkbox.

**"Termination"** — remove the current language stating *"data retained for 30 days before deletion"* (conflicts with the new tiered archival policy).

### New Sections to ADD to existing Terms:

1. **Failed Payments & Account Restriction** — Stripe retry window, Day 9 automatic lockdown, reinstatement process (contact support + proof of payment).
2. **Plan Changes** — upgrades immediate, downgrades at end of billing cycle, feature access during pending downgrade period.
3. **Content Archival & Restoration Policy** — archive on downgrade/cancellation, no deletion during archive period, full restoration on resubscription, retention period varies by plan tier and is as specified on the Pricing page.

### Key Language Principle:
- Do **not** hardcode specific day counts in the Terms.
- Reference *"as specified on our Pricing and Plans page"* for retention periods so the Terms remain accurate when Super Admin changes the values.

---

---

## TOPIC 4: Password Show/Hide Toggle (Login Page)

**Decision: Add eye icon toggle to the login page password field. ✅ BUILT**

- The register page and reset-password page already had this feature built in.
- Only the login page was missing it.
- Implemented: `showPassword` state, `Eye` / `EyeOff` Lucide icons, toggle button with `aria-label` for accessibility.
- No further work needed on this item.

---

## TOPIC 5: New Subscriber Setup / Onboarding Guide

**Decision: Add to plan — requires further discussion before building.**

### Options considered:

**Option A — Welcome Email only**
Triggered on first signup. Contains a checklist of steps to get their site live. Low effort, always in their inbox. Good starting point but passive.

**Option B — In-app Onboarding Checklist (recommended starting point)**
A persistent widget on the admin dashboard (e.g., collapsible card: *"Getting Started — 3 of 6 steps complete"*). Tracks what the author has done and nudges toward the next action. Disappears or collapses once all steps complete. Also valuable for platform analytics — Super Admin can see where new subscribers drop off.

**Option C — Guided Walkthrough (tooltips/highlights)**
Step-by-step highlights of the admin panel on first login. Most powerful but most complex to build and can feel intrusive if not done carefully. Defer until A and B are proven.

### Recommended approach:
Start with **Option B (in-app checklist) + Option A (welcome email)**. This covers the majority of onboarding value without tooltip walkthrough complexity.

### Agreed design decisions:

- **One checklist for all tiers** — no separate versions. Paid-only steps are greyed out for Free subscribers rather than hidden. Simpler to build, simpler to maintain, and no risk of two versions drifting out of sync.
- Each checklist step has a `requiredPlan` property (Free / Standard / Premium). If the author's plan doesn't meet it, the step renders greyed with a lock icon instead of an active checkbox.
- Greyed steps show a small "Standard/Premium" badge and a tooltip on hover: *"Available on Standard and Premium plans"* with a link to the pricing page. Informative upgrade prompt, not a hard sales push.

### Still to decide before building:

1. **What are the exact checklist steps?** Candidates:
   - Complete your author profile (name, bio, photo) — *All plans*
   - Add your first book (cover, description, genre) — *All plans*
   - Customise your site (colours, header) — *All plans*
   - Set up your about page — *All plans*
   - Configure your newsletter signup — *All plans*
   - Connect a custom domain — *Standard/Premium only*
   - Set up digital book sales — *Standard/Premium only*

2. **Is the checklist skippable/dismissible from day one,** or does it persist until all steps are complete?

3. **Does the welcome email come from a AuthorLoft address** (e.g., hello@authorloft.com) or from the author's own connected email identity?

### Development steps for onboarding (when ready):
- Define final checklist steps and plan-tier rules
- Build welcome email template (SES)
- Build dashboard onboarding checklist widget
- Track completion state per author in the database
- Surface checklist abandonment data in Super Admin analytics

---

---

## TOPIC 6: Vercel Account Setup & Deployment

**Status: To be planned — no action taken yet.**

### Account Setup
- Create a Vercel account at vercel.com
- Connect the AuthorLoft GitHub repository to Vercel for automatic deployments
- Set environment variables in Vercel dashboard (database URL, NextAuth secret, Stripe keys, AWS SES credentials, etc.)

### Domain & DNS Configuration
- Register or transfer `authorloft.com` domain
- Configure **Cloudflare** as DNS provider (recommended for wildcard subdomain support)
- Add wildcard DNS record: `*.authorloft.com → Vercel` (this powers the author subdomain routing)
- Add root record: `authorloft.com → Vercel`
- Configure Vercel to recognise both `authorloft.com` and `*.authorloft.com`

### Environment Variables Required in Vercel
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon or Supabase) |
| `NEXTAUTH_SECRET` | NextAuth session signing secret |
| `NEXTAUTH_URL` | Production URL (https://authorloft.com) |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | authorloft.com |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `AWS_ACCESS_KEY_ID` | AWS credentials for SES + S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for SES + S3 |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET` | S3 bucket name for file storage |
| `GOOGLE_CLIENT_ID` | Google OAuth (for Google sign-in) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

### Deployment Flow
- Push to `main` branch → Vercel auto-deploys to production
- Preview deployments on pull requests (for testing before merging)
- Vercel runs `npm run build` automatically on each deploy

---

## TOPIC 7: Stripe Account Setup & Integration

**Status: To be planned — no action taken yet.**

### Account Setup
- Create a Stripe account at stripe.com
- Complete business verification (required for live payments)
- Enable Stripe Customer Portal in the Stripe dashboard

### Products & Pricing to Configure in Stripe
Each plan needs two prices — monthly and annual. Exact amounts are set by Super Admin but Stripe price IDs must be created first.

| Product | Monthly Price | Annual Price |
|---|---|---|
| Standard | As set by Super Admin | ~20% off monthly (as set by Super Admin) |
| Premium | As set by Super Admin | ~20% off monthly (as set by Super Admin) |

- Free plan requires no Stripe product (no payment taken)
- Store Stripe Price IDs in the `Plan` database table so Super Admin can map them

### Stripe Customer Portal Configuration
Configure in Stripe dashboard to allow:
- Plan upgrades and downgrades
- Payment method updates
- Subscription cancellation
- Invoice/billing history view
- Return URL: `https://authorloft.com/admin/billing`

### Webhook Setup
- Create webhook endpoint in Stripe dashboard pointing to: `https://authorloft.com/api/stripe/webhook`
- Select the following events to listen for:

| Stripe Event | AuthorLoft Action |
|---|---|
| `customer.subscription.created` | Record subscription start, set `initialSubscriptionDate` |
| `customer.subscription.updated` | Update plan, handle scheduled downgrade |
| `customer.subscription.deleted` | Trigger cancellation path (archive or delete) |
| `invoice.payment_succeeded` | Mark payment active, clear any restriction flag |
| `invoice.payment_failed` | Flag payment failed, begin warning email sequence |
| `invoice.payment_action_required` | Alert author to complete payment action |
| `charge.refunded` | Confirm refund processed, trigger account deletion |

### Annual Billing Acknowledgment Checkbox
- The checkout flow for annual plans must display and require:
  > *"I understand this plan is non-refundable after 30 days."*
- This is enforced in the AuthorLoft UI before redirecting to Stripe Checkout — not within Stripe itself

### Refund Processing
- Refunds within the 30-day window are processed manually by Super Admin via Stripe API
- Super Admin panel will include a "Process Refund" action that calls the Stripe Refund API and then triggers immediate account deletion
- Stripe provides full refund to the original payment method automatically

### Test vs Live Mode
- Use Stripe **test mode** during development (test API keys, test card numbers)
- Switch to **live mode** keys in Vercel production environment variables only when ready to accept real payments
- Never commit API keys to the repository

---

## Development Steps (Agreed Order)

| Step | Work Item | Status |
|---|---|---|
| ✅ | Password show/hide toggle on login page | **Complete** |
| 1 | Write updated Terms of Service content (additions to existing) | **Complete** |
| 2 | Set up Vercel account, connect repo, configure domain & DNS | Not started |
| 3 | Set up Stripe account, create products/prices, configure Customer Portal & webhooks | Not started |
| 4 | Plan database schema changes (new subscription tracking fields, platformSettings additions) | Not started |
| 5 | Plan Stripe integration code (webhooks, Customer Portal launch, annual checkout checkbox) | Not started |
| 6 | Plan feature gating and archival logic (app-side enforcement) | Not started |
| 7 | Plan Super Admin visibility and override screens | Not started |
| 8 | Plan SES notification email templates | Not started |
| 9 | Finalise onboarding checklist steps and plan-tier rules | Not started |
| 10 | Build welcome email template + in-app onboarding checklist widget | Not started |

---

*This document captures all planning decisions made in discussion. No development has begun. All items above are agreed and ready to proceed in the order listed.*
