-- Drop old single-book FK from DiscountCode (no production data yet)
ALTER TABLE "DiscountCode" DROP COLUMN IF EXISTS "bookId";

-- Add showAsSalePrice flag
ALTER TABLE "DiscountCode" ADD COLUMN "showAsSalePrice" BOOLEAN NOT NULL DEFAULT false;

-- Create many-to-many join table
CREATE TABLE "DiscountCodeBook" (
    "discountCodeId" TEXT NOT NULL,
    "bookId"         TEXT NOT NULL,
    CONSTRAINT "DiscountCodeBook_pkey" PRIMARY KEY ("discountCodeId", "bookId")
);

CREATE INDEX "DiscountCodeBook_bookId_idx" ON "DiscountCodeBook"("bookId");

ALTER TABLE "DiscountCodeBook"
    ADD CONSTRAINT "DiscountCodeBook_discountCodeId_fkey"
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCodeBook"
    ADD CONSTRAINT "DiscountCodeBook_bookId_fkey"
    FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
