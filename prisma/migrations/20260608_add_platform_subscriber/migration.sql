-- Public AuthorLoft News subscriber list (platform-scoped, no authorId).
-- Managed via the app's Prisma (superuser) connection, so service_role grants only.
CREATE TABLE IF NOT EXISTS "PlatformSubscriber" (
  "id"               TEXT NOT NULL,
  "email"            TEXT NOT NULL,
  "name"             TEXT,
  "isConfirmed"      BOOLEAN NOT NULL DEFAULT false,
  "confirmToken"     TEXT,
  "unsubscribeToken" TEXT NOT NULL,
  "source"           TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSubscriber_email_key"        ON "PlatformSubscriber" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSubscriber_confirmToken_key" ON "PlatformSubscriber" ("confirmToken");
CREATE INDEX        IF NOT EXISTS "PlatformSubscriber_createdAt_idx"    ON "PlatformSubscriber" ("createdAt");

-- Grants (Supabase Oct 30 2026 compliance). Admin/system table → service_role only.
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."PlatformSubscriber" TO service_role;
