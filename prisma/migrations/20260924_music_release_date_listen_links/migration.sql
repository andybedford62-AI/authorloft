-- MUSIC only: optional release date (shown as the year in the hero) and
-- album-level "Listen on" links, stored as a JSON array of https URL strings.
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "releaseDate" DATE;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "listenLinks" JSONB;
