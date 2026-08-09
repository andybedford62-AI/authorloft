-- SocialPlatformToken
CREATE TABLE "SocialPlatformToken" (
  "id"             TEXT NOT NULL,
  "platform"       TEXT NOT NULL,
  "accessToken"    TEXT NOT NULL,
  "accountId"      TEXT NOT NULL,
  "accountName"    TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMP(3),
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPlatformToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialPlatformToken_platform_key" ON "SocialPlatformToken"("platform");

-- SocialPost
CREATE TABLE "SocialPost" (
  "id"          TEXT NOT NULL,
  "caption"     TEXT NOT NULL,
  "mediaUrl"    TEXT,
  "mediaType"   TEXT,
  "platforms"   TEXT[] NOT NULL DEFAULT '{}',
  "status"      TEXT NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialPost_status_scheduledAt_idx" ON "SocialPost"("status", "scheduledAt");

-- SocialPostResult
CREATE TABLE "SocialPostResult" (
  "id"             TEXT NOT NULL,
  "postId"         TEXT NOT NULL,
  "platform"       TEXT NOT NULL,
  "status"         TEXT NOT NULL DEFAULT 'PENDING',
  "platformPostId" TEXT,
  "error"          TEXT,
  "publishedAt"    TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPostResult_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SocialPostResult_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE
);
CREATE INDEX "SocialPostResult_postId_idx" ON "SocialPostResult"("postId");

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SocialPlatformToken" TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SocialPost" TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SocialPostResult" TO service_role;
