-- Shipping profiles + zones for print orders (replaces the single flat Author.printShippingCents).
-- Additive and idempotent: new tables/columns only, then a backfill that preserves today's behaviour
-- (every author with a PRINT item gets a "Standard" profile = their old flat fee, charged once per order,
-- to the six countries checkout previously allowed). Safe to apply ahead of the code; safe to re-run.

ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "shipFromCountry" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingBreakdown" JSONB;

CREATE TABLE IF NOT EXISTS "ShippingProfile" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "freeOverCents" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ShippingProfile_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ShippingProfile_authorId_idx" ON "ShippingProfile"("authorId");

CREATE TABLE IF NOT EXISTS "ShippingZone" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isRestOfWorld" BOOLEAN NOT NULL DEFAULT false,
  "firstItemCents" INTEGER NOT NULL,
  "additionalItemCents" INTEGER NOT NULL DEFAULT 0,
  "estimateNote" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ShippingZone_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ShippingProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ShippingZone_profileId_idx" ON "ShippingZone"("profileId");

ALTER TABLE "BookDirectSaleItem" ADD COLUMN IF NOT EXISTS "shippingProfileId" TEXT;
CREATE INDEX IF NOT EXISTS "BookDirectSaleItem_shippingProfileId_idx" ON "BookDirectSaleItem"("shippingProfileId");
DO $$ BEGIN
  ALTER TABLE "BookDirectSaleItem" ADD CONSTRAINT "BookDirectSaleItem_shippingProfileId_fkey"
    FOREIGN KEY ("shippingProfileId") REFERENCES "ShippingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- New tables get no automatic Data API access: grant explicitly (anon read-only).
GRANT SELECT ON TABLE "ShippingProfile" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ShippingProfile" TO authenticated, postgres, service_role;
GRANT SELECT ON TABLE "ShippingZone" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ShippingZone" TO authenticated, postgres, service_role;

-- Backfill: one "Standard" profile per author that has a PRINT item and no profile yet.
INSERT INTO "ShippingProfile" ("id", "authorId", "name", "updatedAt")
SELECT gen_random_uuid()::text, a."id", 'Standard', CURRENT_TIMESTAMP
FROM "Author" a
WHERE EXISTS (
    SELECT 1 FROM "BookDirectSaleItem" s JOIN "Book" b ON b."id" = s."bookId"
    WHERE b."authorId" = a."id" AND s."format" = 'PRINT'
  )
  AND NOT EXISTS (SELECT 1 FROM "ShippingProfile" p WHERE p."authorId" = a."id");

-- Its single zone = the six countries checkout used to allow, at the old flat fee, nothing extra per additional item.
INSERT INTO "ShippingZone" ("id", "profileId", "name", "countries", "firstItemCents", "additionalItemCents")
SELECT gen_random_uuid()::text, p."id", 'Everywhere we ship', ARRAY['US','CA','GB','AU','NZ','IE'],
       COALESCE(a."printShippingCents", 0), 0
FROM "ShippingProfile" p JOIN "Author" a ON a."id" = p."authorId"
WHERE p."name" = 'Standard'
  AND NOT EXISTS (SELECT 1 FROM "ShippingZone" z WHERE z."profileId" = p."id");

UPDATE "BookDirectSaleItem" s
SET "shippingProfileId" = p."id"
FROM "Book" b, "ShippingProfile" p
WHERE b."id" = s."bookId" AND p."authorId" = b."authorId" AND p."name" = 'Standard'
  AND s."format" = 'PRINT' AND s."shippingProfileId" IS NULL;
