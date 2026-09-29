-- Plan-downgrade grace period: track the 30-day grace window on Author and mark
-- items auto-unpublished by a plan downgrade so they can be restored on upgrade.
-- Additive, nullable/defaulted columns only; no new tables (no GRANTs needed).
ALTER TABLE "Author"
  ADD COLUMN IF NOT EXISTS "planGraceStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "planGraceEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "planGraceStage" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Book"     ADD COLUMN IF NOT EXISTS "hiddenByPlanAt" TIMESTAMP(3);
ALTER TABLE "Course"   ADD COLUMN IF NOT EXISTS "hiddenByPlanAt" TIMESTAMP(3);
ALTER TABLE "Post"     ADD COLUMN IF NOT EXISTS "hiddenByPlanAt" TIMESTAMP(3);
ALTER TABLE "FlipBook" ADD COLUMN IF NOT EXISTS "hiddenByPlanAt" TIMESTAMP(3);
