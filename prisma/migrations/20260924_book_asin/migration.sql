-- ASIN gets its own field (it was being typed into ISBN). Additive.
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "asin" TEXT;

-- Move ASINs that were stored in isbn (10-char Amazon IDs starting B0).
UPDATE "Book"
SET "asin" = substring("isbn" from 'B0[A-Z0-9]{8}'), "isbn" = NULL
WHERE "asin" IS NULL AND "isbn" ~ 'B0[A-Z0-9]{8}' AND "isbn" !~ '97[89]';

-- Strip pasted invisible direction marks and stray spaces from ISBNs.
UPDATE "Book"
SET "isbn" = NULLIF(btrim(regexp_replace("isbn", '[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]', '', 'g')), '')
WHERE "isbn" IS NOT NULL;
