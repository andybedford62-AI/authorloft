#!/usr/bin/env node
// Fails the build if any environment variable listed as "required" in
// scripts/required-env.json is missing. Warns (does not fail) on missing
// "optional" entries.
//
// This catches the silent-failure class of bug where a feature ships but
// its env var was never configured in Vercel: the symptom is usually a
// confusing runtime error (401, NaN, empty response) rather than a clear
// "X is not set." E.g. CRON_SECRET was missing for weeks before being
// caught — all 6 cron jobs were silently 401-ing.
//
// Bypass for emergencies only: SKIP_REQUIRED_ENV_CHECK=1.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.SKIP_REQUIRED_ENV_CHECK === "1") {
  console.warn("[required-env] SKIP_REQUIRED_ENV_CHECK=1 — skipping check (use only in emergencies).");
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "required-env.json");

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.error(`[required-env] failed to read ${manifestPath}: ${err.message}`);
  process.exit(1);
}

const isSet = (name) => {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0;
};

const missingRequired = (manifest.required || [])
  .filter((entry) => !isSet(entry.name));

const missingOptional = (manifest.optional || [])
  .filter((entry) => !isSet(entry.name));

if (missingOptional.length > 0) {
  console.warn("");
  console.warn("[required-env] optional env vars not set (build continues):");
  for (const e of missingOptional) {
    console.warn(`  - ${e.name}: ${e.purpose}`);
  }
}

if (missingRequired.length === 0) {
  console.log(`[required-env] OK — all ${manifest.required.length} required env vars are set.`);
  process.exit(0);
}

console.error("");
console.error("==================================================================");
console.error(" REQUIRED ENV VARS MISSING - build halted");
console.error("==================================================================");
console.error("");
console.error(" The following env vars are required but not set in this build:");
console.error("");
for (const e of missingRequired) {
  console.error(`  - ${e.name}`);
  console.error(`      ${e.purpose}`);
}
console.error("");
console.error(" To fix: add each missing key in Vercel -> Settings -> Environment");
console.error(" Variables (Production + Preview + Development), then redeploy.");
console.error("");
console.error(" See scripts/required-env.json for the full manifest.");
console.error(" See CLAUDE.md -> 'Environment variables' for the workflow.");
console.error("");
process.exit(1);
