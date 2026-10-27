-- Post.emailedAt: once-only guard for the opt-in "email this post to subscribers" action. Additive nullable column; safe to apply ahead of the code.
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "emailedAt" TIMESTAMP(3);
