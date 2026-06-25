#!/usr/bin/env node
// Fails the build if prisma/schema.prisma describes columns/tables the live DB
// is missing (or has extras). This is the guardrail that catches the class of
// bug where a schema change ships to Vercel but the corresponding ALTER was
// never applied to Supabase — the symptom is a runtime "column does not exist"
// error (which surfaces to users as "Invalid email or password" on the login
// page, because NextAuth swallows the Prisma error).
//
// To fix drift: apply the SQL printed below to Supabase (via the supabase MCP
// `apply_migration` tool or the SQL editor) then redeploy.

import { execSync } from "node:child_process";

// Prefer DIRECT_URL (non-pooled, port 5432) because prisma migrate diff fails
// on PgBouncer transaction-mode connections with "prepared statement already
// exists." Fall back to DATABASE_URL for environments that only set one.
if (process.env.SKIP_SCHEMA_DRIFT_CHECK === "1") {
  console.warn("[schema-drift-check] SKIP_SCHEMA_DRIFT_CHECK=1 set — skipping drift check (use only in emergencies).");
  process.exit(0);
}

const DB_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  // In a Vercel build, having no DB URL means the guardrail is silently
  // disabled — fail loudly instead so the env misconfiguration is fixed.
  if (process.env.VERCEL === "1") {
    console.error("[schema-drift-check] FATAL: no DIRECT_URL or DATABASE_URL set in this Vercel build.");
    console.error("  Add DIRECT_URL (the non-pooled db.<ref>.supabase.co:5432 URL) to the Vercel project's");
    console.error("  Production + Preview + Development env vars, or set SKIP_SCHEMA_DRIFT_CHECK=1 to bypass.");
    process.exit(1);
  }
  console.warn("[schema-drift-check] No DIRECT_URL or DATABASE_URL — skipping drift check (local).");
  process.exit(0);
}

let sql = "";
let exitCode = 0;
try {
  // --from-url DB  --to-schema-datamodel schema  → SQL that would bring DB up to schema.
  // --exit-code: 0 = in sync, 2 = drift, 1 = error.
  sql = execSync(
    `npx --yes prisma migrate diff --from-url "${DB_URL}" --to-schema-datamodel ./prisma/schema.prisma --script --exit-code`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
  );
} catch (err) {
  exitCode = err.status ?? 1;
  sql = (err.stdout?.toString() ?? "") + (err.stderr?.toString() ?? "");
}

if (exitCode === 0) {
  console.log("[schema-drift-check] OK — schema.prisma and DB are in sync.");
  process.exit(0);
}

if (exitCode === 2) {
  // Only fail the build on drift that would actually break runtime:
  //   ADD COLUMN  — code SELECTs a column the DB doesn't have (the exact bug
  //                 that motivated this script: Author.googleSiteVerification
  //                 missing → all credentials logins returned null → users
  //                 saw "Invalid email or password").
  //   CREATE TABLE — code queries a relation the DB doesn't have.
  //   CREATE TYPE  — an enum referenced by a column is missing.
  //
  // Prisma migrate diff also emits a lot of cosmetic noise that does NOT
  // break runtime: FK cascade-rule re-orders that drop+re-add the same FK,
  // TIMESTAMP precision normalisations, DROP DEFAULT on updatedAt (Prisma
  // sets these client-side), id-column default changes for cuid columns,
  // etc. Those are ignored.
  const dangerous = sql
    .split(/\r?\n/)
    .filter((line) => /\b(ADD COLUMN|CREATE TABLE|CREATE TYPE)\b/i.test(line));

  if (dangerous.length === 0) {
    console.log(
      "[schema-drift-check] OK — only cosmetic drift detected (FK re-order / precision / defaults). No missing tables or columns."
    );
    process.exit(0);
  }

  console.error("");
  console.error("==================================================================");
  console.error(" SCHEMA DRIFT DETECTED - build halted");
  console.error("==================================================================");
  console.error("");
  console.error(" prisma/schema.prisma describes tables or columns that do not");
  console.error(" exist in the live database. If this deploy went out, the");
  console.error(" Prisma client would query things that aren't there and runtime");
  console.error(" auth/data calls would fail (NextAuth swallows the Prisma error");
  console.error(" and surfaces it as 'Invalid email or password' on the login");
  console.error(" page — that is the symptom of this class of bug).");
  console.error("");
  console.error(" Missing in DB:");
  for (const line of dangerous) {
    console.error("   " + line.trim());
  }
  console.error("");
  console.error(" Full diff (apply to Supabase via MCP `apply_migration` then");
  console.error(" redeploy):");
  console.error("");
  console.error("------------------------------------------------------------------");
  console.error(sql.trim());
  console.error("------------------------------------------------------------------");
  console.error("");
  console.error(" See CLAUDE.md -> 'Database & migrations' for the workflow.");
  console.error("");
  process.exit(1);
}

console.error("[schema-drift-check] prisma migrate diff failed:");
console.error(sql);
process.exit(1);
