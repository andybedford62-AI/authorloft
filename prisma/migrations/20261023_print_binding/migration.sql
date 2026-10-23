-- Print editions can be Paperback or Hardcover (decides which format card the book page sells them under).
-- Additive nullable column; null keeps today's behaviour (Paperback). Safe to apply ahead of the code.
ALTER TABLE "BookDirectSaleItem" ADD COLUMN IF NOT EXISTS "printBinding" TEXT;
