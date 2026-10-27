-- Newsletter: scheduled sends (Campaign.status/scheduledFor), autosaved drafts, saved templates.
-- Additive only; existing Campaign rows default to status 'SENT'. Safe to apply ahead of the code.
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'SENT';
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Campaign_status_scheduledFor_idx" ON "Campaign"("status", "scheduledFor");

CREATE TABLE IF NOT EXISTS "NewsletterDraft" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "subject" TEXT NOT NULL DEFAULT '',
  "body" TEXT NOT NULL DEFAULT '',
  "categoryFilter" TEXT[] NOT NULL DEFAULT '{}',
  "includeBooks" BOOLEAN NOT NULL DEFAULT true,
  "includeReview" BOOLEAN NOT NULL DEFAULT true,
  "specialId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterDraft_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NewsletterDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "NewsletterDraft_authorId_updatedAt_idx" ON "NewsletterDraft"("authorId", "updatedAt");

CREATE TABLE IF NOT EXISTS "NewsletterTemplate" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL DEFAULT '',
  "body" TEXT NOT NULL DEFAULT '',
  "includeBooks" BOOLEAN NOT NULL DEFAULT true,
  "includeReview" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsletterTemplate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NewsletterTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "NewsletterTemplate_authorId_idx" ON "NewsletterTemplate"("authorId");

GRANT SELECT ON TABLE "NewsletterDraft" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "NewsletterDraft" TO authenticated, postgres, service_role;
GRANT SELECT ON TABLE "NewsletterTemplate" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "NewsletterTemplate" TO authenticated, postgres, service_role;
