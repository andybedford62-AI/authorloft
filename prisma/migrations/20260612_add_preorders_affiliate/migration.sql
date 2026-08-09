-- Sprint 1 (Author Empowerment): Pre-orders / Coming Soon + Affiliate program

-- AlterTable: Plan — pre-orders feature gate (default true; FREE set false via data update)
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "preOrdersEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Book — pre-order + affiliate fields
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "isPreOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "preOrderDate" TIMESTAMP(3);
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "affiliateEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "affiliateCommissionPercent" INTEGER NOT NULL DEFAULT 10;

-- CreateTable: PreOrderSignup
CREATE TABLE IF NOT EXISTS "PreOrderSignup" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreOrderSignup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PreOrderSignup_bookId_email_key" ON "PreOrderSignup"("bookId", "email");
CREATE INDEX IF NOT EXISTS "PreOrderSignup_bookId_idx" ON "PreOrderSignup"("bookId");
CREATE INDEX IF NOT EXISTS "PreOrderSignup_authorId_idx" ON "PreOrderSignup"("authorId");

ALTER TABLE "PreOrderSignup" ADD CONSTRAINT "PreOrderSignup_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreOrderSignup" ADD CONSTRAINT "PreOrderSignup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: AffiliateReferral
CREATE TABLE IF NOT EXISTS "AffiliateReferral" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "label" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "saleCount" INTEGER NOT NULL DEFAULT 0,
    "earningsCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateReferral_bookId_refCode_key" ON "AffiliateReferral"("bookId", "refCode");
CREATE INDEX IF NOT EXISTS "AffiliateReferral_bookId_idx" ON "AffiliateReferral"("bookId");

ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase GRANT statements (required for Data API compliance)
GRANT SELECT ON "public"."PreOrderSignup" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PreOrderSignup" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PreOrderSignup" TO service_role;

GRANT SELECT ON "public"."AffiliateReferral" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AffiliateReferral" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."AffiliateReferral" TO service_role;
