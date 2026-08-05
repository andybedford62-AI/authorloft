-- Replaces the single earlyBird* fields on SystemConfig with a library of
-- reusable offer presets. Exactly one row is `enabled` at a time (enforced
-- in the API); that's the offer the dashboard banner shows and checkout
-- applies. Coupon ID columns fall back to the STRIPE_EARLY_BIRD_COUPON_
-- MONTHLY/ANNUAL env vars when null.

CREATE TABLE IF NOT EXISTS "EarlyBirdOffer" (
  "id"              TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "enabled"         BOOLEAN NOT NULL DEFAULT false,
  "percentOff"      INTEGER NOT NULL,
  "durationMonths"  INTEGER NOT NULL,
  "windowDays"      INTEGER NOT NULL,
  "couponIdMonthly" TEXT,
  "couponIdAnnual"  TEXT,
  "headline"        TEXT,
  "subtext"         TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EarlyBirdOffer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EarlyBirdOffer_enabled_idx" ON "EarlyBirdOffer"("enabled");

GRANT ALL ON TABLE "EarlyBirdOffer" TO anon, authenticated, postgres, service_role;

-- Seed one row carrying over whatever was live on SystemConfig so behavior
-- doesn't change the moment this migration runs.
INSERT INTO "EarlyBirdOffer" ("id", "name", "enabled", "percentOff", "durationMonths", "windowDays", "couponIdMonthly", "couponIdAnnual", "updatedAt")
SELECT
  'seed_' || substr(md5(random()::text), 1, 20),
  'Founding Member Offer',
  COALESCE("earlyBirdEnabled", true),
  COALESCE("earlyBirdPercentOff", 20),
  COALESCE("earlyBirdDurationMonths", 3),
  COALESCE("earlyBirdWindowDays", 30),
  "earlyBirdCouponIdMonthly",
  "earlyBirdCouponIdAnnual",
  CURRENT_TIMESTAMP
FROM "SystemConfig" WHERE id = 'main';

ALTER TABLE "SystemConfig"
  DROP COLUMN IF EXISTS "earlyBirdEnabled",
  DROP COLUMN IF EXISTS "earlyBirdPercentOff",
  DROP COLUMN IF EXISTS "earlyBirdDurationMonths",
  DROP COLUMN IF EXISTS "earlyBirdWindowDays",
  DROP COLUMN IF EXISTS "earlyBirdCouponIdMonthly",
  DROP COLUMN IF EXISTS "earlyBirdCouponIdAnnual";
