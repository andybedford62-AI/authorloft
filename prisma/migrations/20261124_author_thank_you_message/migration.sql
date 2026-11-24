-- Author: personal thank-you note shown to buyers in confirmation emails (nullable, additive).
ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "thankYouMessage" TEXT;
