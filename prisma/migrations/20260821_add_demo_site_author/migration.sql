ALTER TABLE "PlatformSettings"
  ADD COLUMN IF NOT EXISTS "demoAuthorId" TEXT;

ALTER TABLE "PlatformSettings"
  ADD CONSTRAINT "PlatformSettings_demoAuthorId_fkey"
  FOREIGN KEY ("demoAuthorId") REFERENCES "Author"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
