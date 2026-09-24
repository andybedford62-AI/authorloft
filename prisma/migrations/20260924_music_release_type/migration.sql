-- Music release type (Playlist / Album / EP / Single). Null on COURSE rows;
-- MUSIC rows with no value render as a Playlist.
CREATE TYPE "MusicReleaseType" AS ENUM ('PLAYLIST', 'ALBUM', 'EP', 'SINGLE');
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "releaseType" "MusicReleaseType";
