-- Order: when the author sent the buyer a feedback-request follow-up (nullable, additive).
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "followUpSentAt" TIMESTAMP(3);
