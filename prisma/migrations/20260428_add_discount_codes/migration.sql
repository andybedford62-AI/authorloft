-- Add discount fields to Order
ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "discountCodeId" TEXT;

-- Create DiscountCode table
CREATE TABLE "DiscountCode" (
    "id"          TEXT NOT NULL,
    "authorId"    TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "description" TEXT,
    "type"        TEXT NOT NULL,
    "value"       INTEGER NOT NULL,
    "maxUses"     INTEGER,
    "usesCount"   INTEGER NOT NULL DEFAULT 0,
    "expiresAt"   TIMESTAMP(3),
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "bookId"      TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- Indexes and constraints
CREATE UNIQUE INDEX "DiscountCode_authorId_code_key" ON "DiscountCode"("authorId", "code");
CREATE INDEX "DiscountCode_authorId_idx" ON "DiscountCode"("authorId");

-- Foreign keys
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_bookId_fkey"
    FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_discountCodeId_fkey"
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
