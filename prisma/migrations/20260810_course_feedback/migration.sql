-- CreateTable: CourseFeedback
-- Mirrors BookFeedback (reuses its BookFeedbackStatus enum -- same 3 states,
-- no need for a duplicate enum) so course cards can show star ratings the
-- same way book cards already do.
CREATE TABLE "CourseFeedback" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "BookFeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseFeedback_courseId_idx" ON "CourseFeedback"("courseId");
CREATE INDEX "CourseFeedback_status_idx" ON "CourseFeedback"("status");

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "CourseFeedback" TO anon, authenticated, postgres, service_role;
