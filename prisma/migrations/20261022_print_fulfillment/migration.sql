-- Print fulfillment: shipping fee paid, shipped/tracking record, author's flat shipping rate.
-- Additive: nullable / defaulted columns, safe to apply ahead of the code.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "printShippingCents" INTEGER;
