-- CreateEnum
CREATE TYPE "BookFeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "BookFeedback" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "BookFeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookFeedback_bookId_idx" ON "BookFeedback"("bookId");

-- CreateIndex
CREATE INDEX "BookFeedback_status_idx" ON "BookFeedback"("status");

-- AddForeignKey
ALTER TABLE "BookFeedback" ADD CONSTRAINT "BookFeedback_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase GRANT statements (required for Data API compliance)
GRANT SELECT ON "public"."BookFeedback" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookFeedback" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."BookFeedback" TO service_role;
