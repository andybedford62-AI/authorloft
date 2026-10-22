-- Testimonials submitted through /share-your-story. Additive: nullable / defaulted columns.
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "submitterEmail" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "consentToPublish" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "source" TEXT;
