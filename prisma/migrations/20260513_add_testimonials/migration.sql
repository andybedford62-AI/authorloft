-- CreateTable
CREATE TABLE "Testimonial" (
  "id"           TEXT NOT NULL,
  "authorName"   TEXT NOT NULL,
  "authorRole"   TEXT,
  "quote"        TEXT NOT NULL,
  "rating"       INTEGER,
  "image"        TEXT,
  "isActive"     BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- Grants
GRANT SELECT ON "public"."Testimonial" TO anon;
GRANT SELECT ON "public"."Testimonial" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Testimonial" TO service_role;
