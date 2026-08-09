# AuthorLoft News / Newsletter — Phase 2 Plan (deferred)

**Phase 1 shipped June 8, 2026** — public `/news` archive, Blog/News CMS toggle, and
public subscriber capture (no email sending). See `project_news_feature` memory and
`docs/FEATURE_BACKLOG.md`. This doc captures the **next steps** to come back to.

## Where the audience lives now
- Table `PlatformSubscriber` (email unique, name?, isConfirmed, confirmToken?,
  `unsubscribeToken` already generated per row, source, createdAt).
- Captured from the `/news` page, the marketing footer, and the homepage via
  `POST /api/news/subscribe`. Viewable/exportable at `/super-admin/subscribers`.
- **No email is sent yet** — every row is effectively "unconfirmed but on the list."

## Phase 2 scope (build when ready to email)

1. **Compose + send a news issue to subscribers**
   - Reuse the existing broadcast/mass-email infrastructure (see the author-facing
     `Campaign` / `BroadcastTemplate` system and `src/lib/email-integrations`).
   - Likely a "Send as email" action on a published News post, or a dedicated
     compose screen that targets `PlatformSubscriber`s.
   - Record sends (a `PlatformCampaign`-style table) for totals/auditing.

2. **Double opt-in (GDPR)**
   - On signup, send a confirmation email with `confirmToken`; flip `isConfirmed`
     on click. Only email confirmed subscribers.
   - Add a public confirm route (e.g. `/news/confirm/[token]`).

3. **Unsubscribe**
   - Public unsubscribe page using the stored `unsubscribeToken`
     (e.g. `/news/unsubscribe/[token]`), plus an unsubscribe link in every email.

4. **Optional niceties**
   - "Publish News post → also email subscribers" one-click.
   - RSS feed for `/news`; category filter on the archive.
   - Provider sync (Resend/Mailchimp/etc.) mirroring the author newsletter integration.

## Notes / gotchas
- Migrations are NOT auto-applied on deploy (build runs `prisma generate` only) —
  apply any new tables/columns directly to Supabase via MCP, and **new tables need
  GRANTs** (service_role at minimum). See `project_migrations_not_auto_applied` and
  `project_supabase_grants` memories.
- Email sending needs a verified sender/domain and an unsubscribe mechanism before
  going live to a real list.
