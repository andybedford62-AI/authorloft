-- ============================================================================
-- AuthorLoft — Supabase GRANT Statements
-- Date: May 13, 2026
--
-- PURPOSE:
--   Comply with Supabase requirement for explicit GRANT statements on all
--   tables. Supabase deadline: October 30 for all existing projects.
--
-- ROLE DEFINITIONS:
--   • anon: Anonymous/unauthenticated users via PostgREST API
--   • authenticated: Authenticated users via PostgREST API
--   • service_role: Admin/service operations (superuser-equivalent)
--
-- SAFETY:
--   Prisma uses superuser connection which bypasses RLS and all GRANT
--   restrictions. These statements only affect PostgREST API access.
--   Zero impact on application behavior.
-- ============================================================================

-- ============================================================================
-- SECTION 1: PUBLIC CATALOG TABLES (8 tables)
-- ============================================================================

-- Plan — pricing tiers (shown on marketing page)
GRANT SELECT ON "public"."Plan" TO anon;
GRANT SELECT ON "public"."Plan" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Plan" TO service_role;

-- Genre — book categories
GRANT SELECT ON "public"."Genre" TO anon;
GRANT SELECT ON "public"."Genre" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Genre" TO service_role;

-- Series — book series
GRANT SELECT ON "public"."Series" TO anon;
GRANT SELECT ON "public"."Series" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Series" TO service_role;

-- Book — published books
GRANT SELECT ON "public"."Book" TO anon;
GRANT SELECT ON "public"."Book" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Book" TO service_role;

-- BookGenre — genre/book junction table
GRANT SELECT ON "public"."BookGenre" TO anon;
GRANT SELECT ON "public"."BookGenre" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookGenre" TO service_role;

-- BookRetailerLink — retailer buy links
GRANT SELECT ON "public"."BookRetailerLink" TO anon;
GRANT SELECT ON "public"."BookRetailerLink" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookRetailerLink" TO service_role;

-- Special — promotions and specials
GRANT SELECT ON "public"."Special" TO anon;
GRANT SELECT ON "public"."Special" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Special" TO service_role;

-- Post — published blog posts
GRANT SELECT ON "public"."Post" TO anon;
GRANT SELECT ON "public"."Post" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Post" TO service_role;

-- ============================================================================
-- SECTION 2: AUTHENTICATED TABLES (22 tables)
-- ============================================================================

-- Author — tenant account data
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Author" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Author" TO service_role;

-- AuthorSubscription — plan/billing
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AuthorSubscription" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AuthorSubscription" TO service_role;

-- Session — NextAuth sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Session" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Session" TO service_role;

-- Account — OAuth provider integrations
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Account" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Account" TO service_role;

-- VerificationToken — email verification
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."VerificationToken" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."VerificationToken" TO service_role;

-- ImpersonationLog — super-admin impersonation audit
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ImpersonationLog" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ImpersonationLog" TO service_role;

-- ArcCopy — Advance Reader Copy files
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcCopy" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcCopy" TO service_role;

-- ArcReader — ARC reader registrations
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcReader" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcReader" TO service_role;

-- ArcFile — ARC file uploads
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcFile" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcFile" TO service_role;

-- ArcReaderDownload — ARC download tracking
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcReaderDownload" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ArcReaderDownload" TO service_role;

-- BookAudioTrack — audio content
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookAudioTrack" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookAudioTrack" TO service_role;

-- BookPreviewMedia — preview images/videos
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookPreviewMedia" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookPreviewMedia" TO service_role;

-- BookReview — testimonials
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookReview" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookReview" TO service_role;

-- BookDirectSaleItem — direct-sale format options
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookDirectSaleItem" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookDirectSaleItem" TO service_role;

-- AuthorPage — custom pages (About, Press Kit)
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AuthorPage" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AuthorPage" TO service_role;

-- ContactMessage — contact form submissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ContactMessage" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."ContactMessage" TO service_role;

-- AccessRequest — platform access requests
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AccessRequest" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AccessRequest" TO service_role;

-- DiscountCode — promo codes
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."DiscountCode" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."DiscountCode" TO service_role;

-- DiscountCodeBook — code/book junction
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."DiscountCodeBook" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."DiscountCodeBook" TO service_role;

-- Subscriber — newsletter subscribers
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Subscriber" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Subscriber" TO service_role;

-- Campaign — sent campaigns
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Campaign" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Campaign" TO service_role;

-- FlipBook — flip book creations
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."FlipBook" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."FlipBook" TO service_role;

-- Order — customer orders
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Order" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Order" TO service_role;

-- OrderItem — order line items
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."OrderItem" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."OrderItem" TO service_role;

-- ============================================================================
-- SECTION 3: HELP CENTRE TABLES (4 tables)
-- Public knowledge base — readable by everyone, managed by service_role
-- ============================================================================

-- HelpTopic — top-level help categories
GRANT SELECT ON "public"."HelpTopic" TO anon;
GRANT SELECT ON "public"."HelpTopic" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."HelpTopic" TO service_role;

-- HelpSubtopic — help topic sub-sections
GRANT SELECT ON "public"."HelpSubtopic" TO anon;
GRANT SELECT ON "public"."HelpSubtopic" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."HelpSubtopic" TO service_role;

-- HelpArticle — individual help articles
GRANT SELECT ON "public"."HelpArticle" TO anon;
GRANT SELECT ON "public"."HelpArticle" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."HelpArticle" TO service_role;

-- HelpTooltip — contextual tooltip content
GRANT SELECT ON "public"."HelpTooltip" TO anon;
GRANT SELECT ON "public"."HelpTooltip" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."HelpTooltip" TO service_role;

-- ============================================================================
-- SECTION 4: ADMIN/SYSTEM TABLES (5 tables)
-- ============================================================================

-- SystemConfig — singleton system config
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SystemConfig" TO service_role;

-- PlatformSettings — singleton platform config
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PlatformSettings" TO service_role;

-- PlanFeatureConfig — feature gates per plan tier
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PlanFeatureConfig" TO service_role;

-- InviteCode — beta invite codes
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."InviteCode" TO service_role;

-- StripeEvent — webhook event tracking
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."StripeEvent" TO service_role;

-- ============================================================================
-- VERIFICATION QUERY (run after migration in production)
-- ============================================================================

/*
SELECT
  schemaname,
  tablename,
  (aclexplode(relacl)).grantee::regrole::text AS role,
  (aclexplode(relacl)).privilege_type AS privilege
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename, role;
*/
