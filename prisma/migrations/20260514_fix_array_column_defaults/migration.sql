-- Add empty-array defaults to String[] columns that lacked them,
-- causing NULL constraint violations on author.create() and related ops.

-- Author.pressOutlets
ALTER TABLE "Author" ALTER COLUMN "pressOutlets" SET DEFAULT '{}';
UPDATE "Author" SET "pressOutlets" = '{}' WHERE "pressOutlets" IS NULL;
ALTER TABLE "Author" ALTER COLUMN "pressOutlets" SET NOT NULL;

-- Book.availableFormats
ALTER TABLE "Book" ALTER COLUMN "availableFormats" SET DEFAULT '{}';
UPDATE "Book" SET "availableFormats" = '{}' WHERE "availableFormats" IS NULL;
ALTER TABLE "Book" ALTER COLUMN "availableFormats" SET NOT NULL;

-- Subscriber.categoryPrefs
ALTER TABLE "Subscriber" ALTER COLUMN "categoryPrefs" SET DEFAULT '{}';
UPDATE "Subscriber" SET "categoryPrefs" = '{}' WHERE "categoryPrefs" IS NULL;
ALTER TABLE "Subscriber" ALTER COLUMN "categoryPrefs" SET NOT NULL;
