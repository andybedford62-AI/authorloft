-- Shipping address for orders that include a PRINT item (collected by Stripe Checkout).
-- Additive, nullable: safe to apply ahead of the code.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB;
