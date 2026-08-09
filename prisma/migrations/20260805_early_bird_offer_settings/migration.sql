-- Founding member / "early bird" upgrade offer settings, controlled from
-- Super Admin -> Coupons. Coupon ID columns fall back to the
-- STRIPE_EARLY_BIRD_COUPON_MONTHLY/ANNUAL env vars when null.
ALTER TABLE "SystemConfig"
  ADD COLUMN IF NOT EXISTS "earlyBirdEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "earlyBirdPercentOff" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS "earlyBirdDurationMonths" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "earlyBirdWindowDays" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "earlyBirdCouponIdMonthly" TEXT,
  ADD COLUMN IF NOT EXISTS "earlyBirdCouponIdAnnual" TEXT;
