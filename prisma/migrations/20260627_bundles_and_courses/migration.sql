-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('BOOK', 'BUNDLE', 'COURSE');

-- AlterTable: OrderItem — make bookId nullable, add itemType/bundleId/courseId
ALTER TABLE "OrderItem" ALTER COLUMN "bookId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD COLUMN "itemType" "OrderItemType" NOT NULL DEFAULT 'BOOK';
ALTER TABLE "OrderItem" ADD COLUMN "bundleId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "courseId" TEXT;

-- AlterTable: Plan — add bundle/course feature flags
ALTER TABLE "Plan" ADD COLUMN "bundlesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "coursesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "maxCourses" INTEGER;

-- AlterTable: Author — add nav toggles and relation support
ALTER TABLE "Author" ADD COLUMN "navShowBundles" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Author" ADD COLUMN "navShowCourses" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: Bundle
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BundleItem
CREATE TABLE "BundleItem" (
    "bundleId" TEXT NOT NULL,
    "saleItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("bundleId","saleItemId")
);

-- CreateTable: Course
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CourseModule
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CourseLesson
CREATE TABLE "CourseLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHtml" TEXT,
    "videoUrl" TEXT,
    "fileKey" TEXT,
    "fileName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CourseEnrollment
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "orderId" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT NOT NULL,
    "accessExpiresAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_authorId_slug_key" ON "Bundle"("authorId", "slug");
CREATE INDEX "Bundle_authorId_idx" ON "Bundle"("authorId");

CREATE INDEX "BundleItem_bundleId_idx" ON "BundleItem"("bundleId");

CREATE UNIQUE INDEX "Course_authorId_slug_key" ON "Course"("authorId", "slug");
CREATE INDEX "Course_authorId_idx" ON "Course"("authorId");

CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");

CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");

CREATE UNIQUE INDEX "CourseEnrollment_accessToken_key" ON "CourseEnrollment"("accessToken");
CREATE UNIQUE INDEX "CourseEnrollment_courseId_customerEmail_key" ON "CourseEnrollment"("courseId", "customerEmail");
CREATE INDEX "CourseEnrollment_accessToken_idx" ON "CourseEnrollment"("accessToken");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "BookDirectSaleItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Course" ADD CONSTRAINT "Course_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "Bundle" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "BundleItem" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Course" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CourseModule" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CourseLesson" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CourseEnrollment" TO anon, authenticated, postgres, service_role;
