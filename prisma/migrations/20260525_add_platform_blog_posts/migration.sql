-- CreateTable
CREATE TABLE "PlatformPost" (
  "id"              TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "slug"            TEXT NOT NULL,
  "excerpt"         TEXT NOT NULL DEFAULT '',
  "content"         TEXT NOT NULL DEFAULT '',
  "coverImageUrl"   TEXT,
  "category"        TEXT NOT NULL DEFAULT '',
  "authorName"      TEXT NOT NULL DEFAULT 'AuthorLoft Team',
  "readTimeMinutes" INTEGER NOT NULL DEFAULT 5,
  "displayOrder"    INTEGER NOT NULL DEFAULT 0,
  "isPublished"     BOOLEAN NOT NULL DEFAULT false,
  "publishedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformPost_slug_key" ON "PlatformPost"("slug");
CREATE INDEX "PlatformPost_isPublished_publishedAt_idx" ON "PlatformPost"("isPublished", "publishedAt");
CREATE INDEX "PlatformPost_displayOrder_idx" ON "PlatformPost"("displayOrder");

-- Grants
GRANT SELECT ON "public"."PlatformPost" TO anon;
GRANT SELECT ON "public"."PlatformPost" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PlatformPost" TO service_role;
