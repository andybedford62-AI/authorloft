-- Add per-book opt-in flag for the public AuthorLoft Bookstore (STANDARD+ authors)
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "listInBookstore" BOOLEAN NOT NULL DEFAULT false;
