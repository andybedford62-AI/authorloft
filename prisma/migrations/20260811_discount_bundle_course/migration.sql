-- CreateTable: DiscountCodeBundle
CREATE TABLE "DiscountCodeBundle" (
    "discountCodeId" TEXT NOT NULL,
    "bundleId"       TEXT NOT NULL,
    CONSTRAINT "DiscountCodeBundle_pkey" PRIMARY KEY ("discountCodeId", "bundleId")
);
CREATE INDEX "DiscountCodeBundle_bundleId_idx" ON "DiscountCodeBundle"("bundleId");
ALTER TABLE "DiscountCodeBundle" ADD CONSTRAINT "DiscountCodeBundle_discountCodeId_fkey"
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscountCodeBundle" ADD CONSTRAINT "DiscountCodeBundle_bundleId_fkey"
    FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DiscountCodeCourse
CREATE TABLE "DiscountCodeCourse" (
    "discountCodeId" TEXT NOT NULL,
    "courseId"       TEXT NOT NULL,
    CONSTRAINT "DiscountCodeCourse_pkey" PRIMARY KEY ("discountCodeId", "courseId")
);
CREATE INDEX "DiscountCodeCourse_courseId_idx" ON "DiscountCodeCourse"("courseId");
ALTER TABLE "DiscountCodeCourse" ADD CONSTRAINT "DiscountCodeCourse_discountCodeId_fkey"
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscountCodeCourse" ADD CONSTRAINT "DiscountCodeCourse_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "DiscountCodeBundle" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "DiscountCodeCourse" TO anon, authenticated, postgres, service_role;
