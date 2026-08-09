ALTER TABLE "PlatformSettings"
  ADD COLUMN IF NOT EXISTS "heroHeadlineLine1" TEXT,
  ADD COLUMN IF NOT EXISTS "heroHeadlineLine2" TEXT,
  ADD COLUMN IF NOT EXISTS "heroSubheadline" TEXT;
