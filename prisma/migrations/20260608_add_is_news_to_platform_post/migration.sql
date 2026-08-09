-- Split AuthorLoft News from the blog: news posts (isNews=true) render at /news,
-- blog articles (isNews=false) render at /blog. Additive, backward-compatible.
ALTER TABLE "PlatformPost" ADD COLUMN IF NOT EXISTS "isNews" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "PlatformPost_isNews_isPublished_publishedAt_idx"
  ON "PlatformPost" ("isNews", "isPublished", "publishedAt");
