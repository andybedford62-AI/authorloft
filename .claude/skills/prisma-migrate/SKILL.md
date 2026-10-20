---
name: prisma-migrate
description: Prisma migration workflow — edit schema, apply to Supabase, create migration file
disable-model-invocation: false
---

# Prisma Migration Workflow

Complements your mandatory schema workflow. Use this for guided migrations.

## When to Use

Run this **after editing `prisma/schema.prisma`** to safely apply changes:

```bash
/prisma-migrate
```

## Steps (Automated Walkthrough)

1. **Review your schema edits**
   - What fields/tables are new?
   - What's being removed/renamed?

2. **Generate migration**
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
   ```

3. **Apply to Supabase** (via MCP)
   - Use `apply_migration` before pushing code
   - Always include GRANTs for new tables

4. **Create migration file**
   ```bash
   prisma/migrations/YYYYMMDD_name/migration.sql
   ```

5. **Verify sync**
   ```bash
   npm run check:all
   npx prisma generate
   ```

6. **Commit & push**
   ```bash
   git add prisma/
   git commit -m "chore: update schema — add X table/column"
   ```

## Tips

- **Additive-only changes** (new nullable columns, new tables) are safe to apply to prod DB ahead of code promotion
- **Destructive changes** (dropping columns, renaming fields) require careful planning — discuss first
- **RLS rules?** New tables need, in the same migration (Supabase no longer auto-grants after Oct 30 2026): `GRANT SELECT ON TABLE "name" TO anon;` and `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "name" TO authenticated, postgres, service_role;` (anon is read-only)
- **Type stale?** Run `npx prisma generate` after applying migrations

## See Also

- `docs/CLAUDE.md` — mandatory schema workflow (required reading)
- `scripts/check-grants.mjs` — verifies all tables have proper RLS grants
