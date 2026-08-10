-- "Reuse a prior newsletter" -- Campaign only ever stored subject + delivery
-- counts, so authors had to rebuild the whole newsletter (body, block
-- toggles, category targeting) from scratch every send. Persists the compose
-- config so a past campaign can be duplicated back into the composer.

ALTER TABLE "Campaign" ADD COLUMN "body" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "categoryFilter" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Campaign" ADD COLUMN "includeBooks" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Campaign" ADD COLUMN "includeReview" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Campaign" ADD COLUMN "specialId" TEXT;
