-- Format-first book page: an optional list price per format, and which
-- formats each retailer link sells (empty = all, so existing links are unchanged).
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "formatPrices" JSONB;
ALTER TABLE "BookRetailerLink" ADD COLUMN IF NOT EXISTS "formats" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
