-- Music play counts and like/dislike reactions. Three new tables, all keyed by
-- the song (authorId + trackKey), not CourseLesson.id, which changes on every save.

-- CreateTable
CREATE TABLE "MusicPlay" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "courseId" TEXT,
    "trackKey" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicTrackStat" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "trackKey" TEXT NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "listeners" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicTrackStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicTrackReaction" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "trackKey" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicTrackReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicPlay_authorId_trackKey_day_visitorHash_idx" ON "MusicPlay"("authorId", "trackKey", "day", "visitorHash");

-- CreateIndex
CREATE INDEX "MusicPlay_authorId_createdAt_idx" ON "MusicPlay"("authorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MusicTrackStat_authorId_trackKey_key" ON "MusicTrackStat"("authorId", "trackKey");

-- CreateIndex
CREATE UNIQUE INDEX "MusicTrackReaction_authorId_trackKey_voterHash_key" ON "MusicTrackReaction"("authorId", "trackKey", "voterHash");

-- AddForeignKey
ALTER TABLE "MusicPlay" ADD CONSTRAINT "MusicPlay_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicTrackStat" ADD CONSTRAINT "MusicTrackStat_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicTrackReaction" ADD CONSTRAINT "MusicTrackReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "MusicPlay" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "MusicTrackStat" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "MusicTrackReaction" TO anon, authenticated, postgres, service_role;
