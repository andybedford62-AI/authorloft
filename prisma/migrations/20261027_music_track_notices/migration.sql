-- Music "new tracks" notices: baseline of announced track keys, last-notice time, auto-notify opt-in. Additive; safe to apply ahead of the code.
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "notifiedTrackKeys" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "trackBaselineAt" TIMESTAMP(3);
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "trackNoticeAt" TIMESTAMP(3);
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "autoNotifyTracks" BOOLEAN NOT NULL DEFAULT false;
