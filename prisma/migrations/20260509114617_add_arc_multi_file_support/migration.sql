-- CreateEnum
CREATE TYPE "ArcReaderSource" AS ENUM ('INVITED', 'APPLIED');

-- CreateEnum
CREATE TYPE "ArcReaderStatus" AS ENUM ('PENDING', 'INVITED', 'DOWNLOADED', 'REVIEWED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ArcReviewPlatform" AS ENUM ('AMAZON', 'GOODREADS', 'BOOKBUB', 'BLOG', 'OTHER');

-- CreateTable "ArcCopy"
CREATE TABLE "ArcCopy" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "disclaimer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable "ArcFile"
CREATE TABLE "ArcFile" (
    "id" TEXT NOT NULL,
    "arcCopyId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable "ArcReader"
CREATE TABLE "ArcReader" (
    "id" TEXT NOT NULL,
    "arcCopyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "ArcReaderSource" NOT NULL DEFAULT 'INVITED',
    "status" "ArcReaderStatus" NOT NULL DEFAULT 'INVITED',
    "token" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "reviewPlatform" "ArcReviewPlatform",
    "reviewUrl" TEXT,
    "notes" TEXT,
    "disclaimerAcknowledgedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcReader_pkey" PRIMARY KEY ("id")
);

-- CreateTable "ArcReaderDownload"
CREATE TABLE "ArcReaderDownload" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArcReaderDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArcCopy_bookId_idx" ON "ArcCopy"("bookId");

-- CreateIndex
CREATE INDEX "ArcFile_arcCopyId_idx" ON "ArcFile"("arcCopyId");

-- CreateIndex
CREATE UNIQUE INDEX "ArcFile_arcCopyId_format_key" ON "ArcFile"("arcCopyId", "format");

-- CreateIndex
CREATE INDEX "ArcReader_arcCopyId_idx" ON "ArcReader"("arcCopyId");

-- CreateIndex
CREATE UNIQUE INDEX "ArcReader_token_key" ON "ArcReader"("token");

-- CreateIndex
CREATE INDEX "ArcReader_email_idx" ON "ArcReader"("email");

-- CreateIndex
CREATE INDEX "ArcReaderDownload_readerId_idx" ON "ArcReaderDownload"("readerId");

-- CreateIndex
CREATE INDEX "ArcReaderDownload_fileId_idx" ON "ArcReaderDownload"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ArcReaderDownload_readerId_fileId_key" ON "ArcReaderDownload"("readerId", "fileId");

-- AddForeignKey
ALTER TABLE "ArcCopy" ADD CONSTRAINT "ArcCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcFile" ADD CONSTRAINT "ArcFile_arcCopyId_fkey" FOREIGN KEY ("arcCopyId") REFERENCES "ArcCopy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcReader" ADD CONSTRAINT "ArcReader_arcCopyId_fkey" FOREIGN KEY ("arcCopyId") REFERENCES "ArcCopy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcReaderDownload" ADD CONSTRAINT "ArcReaderDownload_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ArcReader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcReaderDownload" ADD CONSTRAINT "ArcReaderDownload_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ArcFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
