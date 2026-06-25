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

## Database & migrations (Supabase) — critical
- Migrations are NOT auto-applied on deploy. Apply schema changes directly to
  Supabase via MCP (`apply_migration`), or runtime throws "column does not
  exist."
- **Build-time guardrail:** every Vercel build runs `scripts/check-schema-drift.mjs`
  before `next build`. It runs `prisma migrate diff` between `prisma/schema.prisma`
  and the live DB. If the schema describes a column/table/enum the DB is missing
  (`ADD COLUMN` / `CREATE TABLE` / `CREATE TYPE`), the build is halted and the
  required SQL is printed. Cosmetic drift (FK re-orders, TIMESTAMP precision,
  default-clause noise) is ignored.
  - Requires `DIRECT_URL` (or `DATABASE_URL` as fallback) in Vercel env — must
    be the non-pooled `db.<ref>.supabase.co:5432` URL, not the PgBouncer pooler.
  - To bypass for an emergency: `SKIP_SCHEMA_DRIFT_CHECK=1` (do not use without
    a reason).
- **Workflow for any schema change** (mandatory order):
  1. Edit `prisma/schema.prisma`.
  2. Apply the corresponding SQL to Supabase via MCP `apply_migration` **before
     pushing the code**. (For additive changes — new nullable columns / new
     tables — it's safe to apply to prod DB before code is promoted.)
  3. Drop the same SQL into `prisma/migrations/<YYYYMMDD>_<name>/migration.sql`
     so the history lives in git.
  4. Run `npm run check:schema-drift` locally to confirm the DB is in sync,
     then commit and push.
- Every new table needs GRANT statements (anon, authenticated, postgres,
  service_role) — match existing tables.

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
