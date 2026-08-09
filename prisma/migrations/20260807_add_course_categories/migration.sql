-- CreateTable: CourseCategory
CREATE TABLE "CourseCategory" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CourseCategoryAssignment
CREATE TABLE "CourseCategoryAssignment" (
    "courseId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CourseCategoryAssignment_pkey" PRIMARY KEY ("courseId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_authorId_slug_parentId_key" ON "CourseCategory"("authorId", "slug", "parentId");
CREATE INDEX "CourseCategory_authorId_idx" ON "CourseCategory"("authorId");

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CourseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CourseCategoryAssignment" ADD CONSTRAINT "CourseCategoryAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseCategoryAssignment" ADD CONSTRAINT "CourseCategoryAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "CourseCategory" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CourseCategoryAssignment" TO anon, authenticated, postgres, service_role;
