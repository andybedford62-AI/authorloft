-- Author site-URL change history.
-- Retired slugs stay globally unique so nobody else can claim one (which would
-- break the 301 redirect and hand a stranger the original author's search
-- traffic). Requests to a retired slug redirect to the author's current site.

CREATE TABLE IF NOT EXISTS "AuthorSlugHistory" (
  "id"        TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuthorSlugHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthorSlugHistory_slug_key" ON "AuthorSlugHistory"("slug");
CREATE INDEX IF NOT EXISTS "AuthorSlugHistory_authorId_idx" ON "AuthorSlugHistory"("authorId");

ALTER TABLE "AuthorSlugHistory"
  ADD CONSTRAINT "AuthorSlugHistory_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

GRANT ALL ON TABLE "AuthorSlugHistory" TO anon, authenticated, postgres, service_role;
