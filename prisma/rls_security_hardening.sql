-- ============================================================================
-- AuthorLoft — Supabase RLS Security Hardening
-- Generated: 2026-04-15
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste and run this entire file.
--
-- SAFE TO RUN:
--   All application data access uses Prisma via DATABASE_URL (postgres
--   superuser). The postgres superuser has BYPASSRLS privilege and is
--   completely unaffected by RLS. These statements only lock down the
--   Supabase PostgREST API (/rest/v1/ endpoint). No app behaviour changes.
--
-- STRATEGY:
--   • Sensitive tables  → Enable RLS, no policies (deny all via PostgREST)
--   • Public catalog    → Enable RLS + anonymous SELECT policy
--   • Author table      → Enable RLS only (existing policies use auth.uid()
--                         which never matches since the app uses NextAuth,
--                         not Supabase Auth — effectively deny all, which is
--                         correct because Author contains passwordHash,
--                         tokens, and Stripe IDs)
-- ============================================================================


-- ============================================================================
-- 1. AUTHOR
--    Special case: 3 RLS policies already exist but RLS was never switched on.
--    Enabling RLS makes them active. The policies check auth.uid() (Supabase
--    Auth) which is never set by this app, so all PostgREST access is denied.
--    This is intentional — Author contains passwordHash, emailVerifyToken,
--    passwordResetToken, stripeCustomerId, and other sensitive fields.
-- ============================================================================

ALTER TABLE "public"."Author" ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 2. SENSITIVE / PRIVATE TABLES
--    Enable RLS only. No policies = deny all access via PostgREST.
--    Prisma continues to work normally as postgres superuser.
-- ============================================================================

-- Customer orders — contains customer email, payment intent IDs
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;

-- Order line items — contains download tokens, file storage keys
ALTER TABLE "public"."OrderItem" ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers — contains subscriber email addresses
ALTER TABLE "public"."Subscriber" ENABLE ROW LEVEL SECURITY;

-- Direct sale file items — contains internal Supabase storage file keys/paths
ALTER TABLE "public"."BookDirectSaleItem" ENABLE ROW LEVEL SECURITY;

-- Contact form submissions — private messages to authors
ALTER TABLE "public"."ContactMessage" ENABLE ROW LEVEL SECURITY;

-- Platform singleton config — terms/privacy content, super-admin only
ALTER TABLE "public"."PlatformSettings" ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. PUBLIC CATALOG TABLES
--    Data that is intentionally public (visible on author sites).
--    Enable RLS + add an anonymous SELECT policy scoped to published/active
--    rows only. Write operations remain denied via PostgREST.
-- ============================================================================

-- Plan — pricing tiers shown on the public marketing/pricing page
ALTER TABLE "public"."Plan" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_active_plans" ON "public"."Plan";
CREATE POLICY "anon_select_active_plans"
  ON "public"."Plan"
  FOR SELECT
  TO anon, authenticated
  USING ("isActive" = true);


-- Genre — book categories displayed on author sites
ALTER TABLE "public"."Genre" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_genres" ON "public"."Genre";
CREATE POLICY "anon_select_genres"
  ON "public"."Genre"
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- Series — book series displayed on author sites
ALTER TABLE "public"."Series" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_series" ON "public"."Series";
CREATE POLICY "anon_select_series"
  ON "public"."Series"
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- Book — published books displayed on author sites
ALTER TABLE "public"."Book" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_books" ON "public"."Book";
CREATE POLICY "anon_select_published_books"
  ON "public"."Book"
  FOR SELECT
  TO anon, authenticated
  USING ("isPublished" = true);


-- BookGenre — junction table, no sensitive data
ALTER TABLE "public"."BookGenre" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_book_genres" ON "public"."BookGenre";
CREATE POLICY "anon_select_book_genres"
  ON "public"."BookGenre"
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- BookRetailerLink — buy links displayed on author sites
ALTER TABLE "public"."BookRetailerLink" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_active_retailer_links" ON "public"."BookRetailerLink";
CREATE POLICY "anon_select_active_retailer_links"
  ON "public"."BookRetailerLink"
  FOR SELECT
  TO anon, authenticated
  USING ("isActive" = true);


-- Special — active promotions displayed on author sites
ALTER TABLE "public"."Special" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_active_specials" ON "public"."Special";
CREATE POLICY "anon_select_active_specials"
  ON "public"."Special"
  FOR SELECT
  TO anon, authenticated
  USING ("isActive" = true);


-- Post — published blog posts displayed on author sites
ALTER TABLE "public"."Post" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_posts" ON "public"."Post";
CREATE POLICY "anon_select_published_posts"
  ON "public"."Post"
  FOR SELECT
  TO anon, authenticated
  USING ("isPublished" = true);


-- ============================================================================
-- VERIFICATION QUERY
-- Run this after the migration to confirm all tables have RLS enabled.
-- Expected: every row shows relrowsecurity = true
-- ============================================================================

/*
SELECT
  relname  AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN (
    'Author', 'Order', 'OrderItem', 'Subscriber',
    'BookDirectSaleItem', 'ContactMessage', 'PlatformSettings',
    'Plan', 'Genre', 'Series', 'Book', 'BookGenre',
    'BookRetailerLink', 'Special', 'Post'
  )
ORDER BY relname;
*/
