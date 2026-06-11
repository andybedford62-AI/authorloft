Please verify any work to be performed before starting. We need to collaborate
and make sure before changes are done. Ask clarifying questions if needed.

## Deployment workflow
- Work flows dev → staging → prod: push to `dev`, test on staging.authorloft.com,
  then promote to prod in Vercel. Never use vercel.app URLs for auth testing.
- Do NOT use a local dev server — verify on staging.
- Batch related changes and push together to minimize Vercel deployments.
- Push cadence is the user's call: default is to confirm before committing/pushing,
  but when the user says "push freely" proceed without asking until they say
  otherwise. Always confirm before promoting to prod.

## Database & migrations (Supabase) — critical
- Migrations are NOT auto-applied on deploy (build runs `prisma generate` only).
  Apply schema changes directly to Supabase via MCP, or runtime throws
  "column does not exist."
- Every new table needs GRANT statements (anon, authenticated, postgres,
  service_role) — match existing tables.
- Additive changes (new nullable columns / new tables) are safe to apply to the
  prod DB before the code is promoted.

## Code conventions
- Next.js: `params` in `[id]` routes is a Promise — use `const { id } = await params`.
- Run `tsc --noEmit` (and `next build` for big changes) before pushing.
- Read existing files/patterns before writing; match surrounding style.

## Finishing a task — always keep in sync (not a later step)
- Sitemap: update `src/app/sitemap.ts` for any new/removed/renamed public route.
- Accomplished: log shipped work in `docs/CHANGELOG.md` (newest first, by date).
- TODO/backlog: add future/deferred ideas to `docs/FEATURE_BACKLOG.md`; move
  shipped items to its "Shipped (for reference)" list.
- Test before declaring done.

## Source of truth (check before planning features)
- `docs/CHANGELOG.md` = shipped; `docs/FEATURE_BACKLOG.md` = planned/deferred.
- `docs/FEATURE_MATRIX.md` = plan-tier feature matrix (FREE/STANDARD/PREMIUM).
