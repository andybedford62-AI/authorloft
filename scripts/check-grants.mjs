#!/usr/bin/env node
// Fails the build if any public table is missing SELECT/INSERT/UPDATE/DELETE
// GRANTs for the four standard Supabase roles (anon, authenticated, postgres,
// service_role). Catches the "new table works locally but RLS-protected
// queries return 401/403 in prod" class of bug — every table the app uses
// needs these GRANTs in addition to its RLS policies.
//
// On drift, prints the exact GRANT statements to apply via Supabase MCP.
//
// Requires DIRECT_URL (or DATABASE_URL fallback). Bypass:
// SKIP_GRANTS_CHECK=1 (emergencies only).

import pg from "pg";

if (process.env.SKIP_GRANTS_CHECK === "1") {
  console.warn("[grants-check] SKIP_GRANTS_CHECK=1 — skipping (use only in emergencies).");
  process.exit(0);
}

const DB_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  if (process.env.VERCEL === "1") {
    console.error("[grants-check] FATAL: no DIRECT_URL or DATABASE_URL set in this Vercel build.");
    console.error("  Add DIRECT_URL (session-pooler URL) to Vercel env vars, or set SKIP_GRANTS_CHECK=1 to bypass.");
    process.exit(1);
  }
  console.warn("[grants-check] No DIRECT_URL or DATABASE_URL — skipping (local).");
  process.exit(0);
}

const REQUIRED_ROLES = ["anon", "authenticated", "postgres", "service_role"];
const REQUIRED_PRIVS = ["SELECT", "INSERT", "UPDATE", "DELETE"];

// Tables we intentionally don't grant on (system tables, migration history, etc.).
// Add to this list if you add a table that legitimately should NOT have the
// standard four-role GRANT (e.g. a service-role-only audit log).
const ALLOWLIST = new Set([
  "_prisma_migrations",
]);

const client = new pg.Client({ connectionString: DB_URL });

try {
  await client.connect();

  const { rows: missing } = await client.query(`
    WITH expected AS (
      SELECT t.table_name, g.role, p.priv
      FROM (SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE') t
      CROSS JOIN (SELECT unnest($1::text[]) AS role) g
      CROSS JOIN (SELECT unnest($2::text[]) AS priv) p
    ),
    actual AS (
      SELECT table_name, grantee AS role, privilege_type AS priv
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee = ANY($1::text[])
        AND privilege_type = ANY($2::text[])
    )
    SELECT e.table_name, e.role, e.priv
    FROM expected e
    LEFT JOIN actual a USING (table_name, role, priv)
    WHERE a.table_name IS NULL
    ORDER BY e.table_name, e.role, e.priv
  `, [REQUIRED_ROLES, REQUIRED_PRIVS]);

  const filtered = missing.filter((r) => !ALLOWLIST.has(r.table_name));

  if (filtered.length === 0) {
    console.log("[grants-check] OK — every public table has the standard GRANTs for anon/authenticated/postgres/service_role.");
    process.exit(0);
  }

  // Group by table so the SQL output reads cleanly.
  const byTable = new Map();
  for (const r of filtered) {
    if (!byTable.has(r.table_name)) byTable.set(r.table_name, new Set());
    byTable.get(r.table_name).add(`${r.priv} (role ${r.role})`);
  }

  console.error("");
  console.error("==================================================================");
  console.error(" MISSING TABLE GRANTS - build halted");
  console.error("==================================================================");
  console.error("");
  console.error(" The following public tables are missing standard GRANTs. Without");
  console.error(" them, RLS-protected queries will fail at runtime with 401/403");
  console.error(" even if the row-level policy would allow access.");
  console.error("");
  for (const [table, gaps] of byTable) {
    console.error(`  - ${table}`);
    for (const g of gaps) console.error(`      missing ${g}`);
  }
  console.error("");
  console.error(" To fix: apply the following SQL via the Supabase MCP");
  console.error(" `apply_migration` tool (or the SQL editor), then redeploy:");
  console.error("");
  console.error("------------------------------------------------------------------");
  for (const table of byTable.keys()) {
    console.error(`GRANT ALL ON TABLE "${table}" TO anon, authenticated, postgres, service_role;`);
  }
  console.error("------------------------------------------------------------------");
  console.error("");
  console.error(" See CLAUDE.md -> 'Database & migrations' for the workflow.");
  console.error("");
  process.exit(1);
} catch (err) {
  console.error("[grants-check] query failed:", err.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
