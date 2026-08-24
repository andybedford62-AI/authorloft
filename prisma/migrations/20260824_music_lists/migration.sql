-- Music lists reuse the Course -> CourseModule -> CourseLesson tree.
-- A track is a lesson whose videoUrl points at YouTube/Spotify/Suno, so no new
-- tables are created and no GRANTs are needed (existing tables keep theirs).

-- 1. Discriminator. Default COURSE so every existing row keeps its meaning.
DO $$ BEGIN
  CREATE TYPE "CourseKind" AS ENUM ('COURSE', 'MUSIC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Course"
  ADD COLUMN IF NOT EXISTS "kind" "CourseKind" NOT NULL DEFAULT 'COURSE';

-- Keeps the kind-filtered list queries cheap.
CREATE INDEX IF NOT EXISTS "Course_authorId_kind_idx" ON "Course" ("authorId", "kind");

-- 2. Cached Open Graph metadata for a track, so public pages never fetch
--    third-party sites per view.
ALTER TABLE "CourseLesson"
  ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;

-- 3. Plan gating, mirroring coursesEnabled/maxCourses. NULL = unlimited.
ALTER TABLE "Plan"
  ADD COLUMN IF NOT EXISTS "musicEnabled"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "maxMusicLists"    INTEGER,
  ADD COLUMN IF NOT EXISTS "maxTracksPerList" INTEGER;

-- 4. Agreed limits: lists 5/20/unlimited (matching books and courses),
--    tracks 15/50/unlimited.
UPDATE "Plan" SET "musicEnabled" = true, "maxMusicLists" = 5,    "maxTracksPerList" = 15   WHERE "tier" = 'FREE';
UPDATE "Plan" SET "musicEnabled" = true, "maxMusicLists" = 20,   "maxTracksPerList" = 50   WHERE "tier" = 'STANDARD';
UPDATE "Plan" SET "musicEnabled" = true, "maxMusicLists" = NULL, "maxTracksPerList" = NULL WHERE "tier" = 'PREMIUM';
