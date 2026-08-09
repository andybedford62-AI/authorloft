ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "showBadges" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "BadgeDefinition" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT NOT NULL DEFAULT 'Award',
  "threshold" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BadgeDefinition_key_key" ON "BadgeDefinition"("key");
CREATE INDEX IF NOT EXISTS "BadgeDefinition_metric_isActive_idx" ON "BadgeDefinition"("metric", "isActive");

GRANT ALL ON TABLE "BadgeDefinition" TO anon, authenticated, postgres, service_role;
