-- "Music Videos" was built as a course before music lists existed: 14 lessons,
-- every one a YouTube link with a short note. It belongs under kind MUSIC.
-- Targeted by id so this can never sweep up a real course.
--
-- Reversible: UPDATE "Course" SET kind = 'COURSE' WHERE id = 'cmt7okl8m0001k004i1d9zt0y';
-- Nothing is deleted. The single CourseEnrollment row (the author's own, on a
-- free course, no order) is left in place and simply goes unused — music is
-- public, so no access is lost.

UPDATE "Course"
SET "kind" = 'MUSIC'
WHERE id = 'cmt7okl8m0001k004i1d9zt0y'
  AND "kind" = 'COURSE';

-- The module was auto-named "Module 1"; "Tracks" matches what the music admin
-- creates and is what the editor expects to find.
UPDATE "CourseModule"
SET "title" = 'Tracks'
WHERE "courseId" = 'cmt7okl8m0001k004i1d9zt0y'
  AND "title" = 'Module 1';

-- Backfill artwork. These rows predate the metadata fetch, and a YouTube
-- thumbnail is derivable from the video id without calling anything.
UPDATE "CourseLesson" l
SET "thumbnailUrl" =
  'https://i.ytimg.com/vi/' ||
  substring(l."videoUrl" from '[?&]v=([A-Za-z0-9_-]{6,})') ||
  '/hqdefault.jpg'
FROM "CourseModule" m
WHERE m.id = l."moduleId"
  AND m."courseId" = 'cmt7okl8m0001k004i1d9zt0y'
  AND l."thumbnailUrl" IS NULL
  AND l."videoUrl" ~ '[?&]v=[A-Za-z0-9_-]{6,}';
