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

## Branch sync — mandatory
- **Always keep branches in sync with `dev`.** After committing work on any
  feature branch, merge it into `dev` before ending the session. Never let
  feature branches drift out of sync with `dev`.
- Before starting work, fetch `origin/dev` so you're working from the latest state.
- This applies even if we're not using staging for verification — keep everything
  aligned at all times.

## Build-time guardrails (run before every deploy) — DO NOT BYPASS

Three checks run in order at the start of every Vercel build. If any fail,
the build halts and the deploy never ships. All three exist because past
outages were caused by silent drift between the deployed code and the
live environment.

1. **`scripts/check-required-env.mjs`** — verifies every env var listed in
   `scripts/required-env.json` is set. Catches the silent-401 class
   (e.g. CRON_SECRET missing → all crons silently 401'd for weeks).
   Bypass: `SKIP_REQUIRED_ENV_CHECK=1` (emergencies only).
2. **`scripts/check-schema-drift.mjs`** — runs `prisma migrate diff`
   between `prisma/schema.prisma` and the live DB. Fails if any
   `ADD COLUMN` / `CREATE TABLE` / `CREATE TYPE` would be needed in the
   DB. Cosmetic drift (FK re-orders, TIMESTAMP precision, default-clause
   noise) is ignored. Bypass: `SKIP_SCHEMA_DRIFT_CHECK=1`.
3. **`scripts/check-grants.mjs`** — verifies every public table has
   SELECT/INSERT/UPDATE/DELETE for anon/authenticated/postgres/service_role.
   Catches "new table works locally but RLS-protected queries 401 in
   prod." Bypass: `SKIP_GRANTS_CHECK=1`.

All three need `DIRECT_URL` in Vercel env (session-pooler URL —
`aws-N-<region>.pooler.supabase.com:5432`, not the IPv6-only direct
host). Run locally with `npm run check:all`.

## Database & migrations (Supabase) — critical

- Migrations are NOT auto-applied on deploy. Apply schema changes
  directly to Supabase via MCP `apply_migration`.
- **Mandatory workflow for any schema change** (in this order):
  1. Edit `prisma/schema.prisma`.
  2. Apply the corresponding SQL to Supabase via MCP `apply_migration`
     **before pushing the code**. Additive changes (new nullable columns,
     new tables) are safe to apply to prod DB ahead of code promotion.
  3. **If you added a new table:** include `GRANT ALL ON TABLE "X" TO
     anon, authenticated, postgres, service_role;` in the same migration.
     The grants check (#3 above) will block the deploy if you forget.
  4. Drop the same SQL into `prisma/migrations/<YYYYMMDD>_<name>/migration.sql`
     so the history lives in git.
  5. Run `npm run check:all` locally to confirm everything is in sync,
     then commit and push.

## Adding a new env var

- Add it to `scripts/required-env.json` under `required` (if absence
  breaks the app) or `optional` (if it degrades gracefully).
- Set the value in Vercel -> Settings -> Environment Variables across
  Production + Preview + Development **before pushing the code that uses
  it**, otherwise the check (#1 above) will fail the next build.

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
