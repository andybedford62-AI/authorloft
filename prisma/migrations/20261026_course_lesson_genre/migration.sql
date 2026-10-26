-- Music tracks get an optional free-text genre (one per song). Additive nullable column; safe to apply ahead of the code.
ALTER TABLE "CourseLesson" ADD COLUMN IF NOT EXISTS "genre" TEXT;
