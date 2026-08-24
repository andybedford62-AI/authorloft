-- Per-author show/hide for the public /music page, matching the other
-- navShow* toggles. Defaults false so no existing author's nav changes.
ALTER TABLE "Author"
  ADD COLUMN IF NOT EXISTS "navShowMusic" BOOLEAN NOT NULL DEFAULT false;
