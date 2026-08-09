-- Guides: evergreen pillar pages for GEO / topical authority

CREATE TABLE IF NOT EXISTS "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "faqsJson" TEXT,
    "relatedSlugsJson" TEXT,
    "ctaTitle" TEXT,
    "ctaDescription" TEXT,
    "ctaButtonText" TEXT,
    "ctaButtonUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX IF NOT EXISTS "Guide_isPublished_sortOrder_idx" ON "Guide"("isPublished", "sortOrder");

-- GRANTs (match existing tables)
GRANT ALL ON TABLE "Guide" TO anon;
GRANT ALL ON TABLE "Guide" TO authenticated;
GRANT ALL ON TABLE "Guide" TO postgres;
GRANT ALL ON TABLE "Guide" TO service_role;
