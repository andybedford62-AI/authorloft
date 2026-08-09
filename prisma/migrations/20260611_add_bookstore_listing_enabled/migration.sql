-- Add per-plan toggle for AuthorLoft Bookstore listing eligibility (super-admin
-- controlled via Feature Gates; replaces hardcoded STANDARD+ tier check).
-- Default true so existing plans keep current cascade-on-save behavior.
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "bookstoreListingEnabled" BOOLEAN NOT NULL DEFAULT true;
