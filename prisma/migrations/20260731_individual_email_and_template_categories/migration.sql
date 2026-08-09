-- Track single-recipient sends on PlatformBroadcast (nullable, additive)
ALTER TABLE "PlatformBroadcast" ADD COLUMN "recipientAuthorId" TEXT;
ALTER TABLE "PlatformBroadcast" ADD COLUMN "recipientEmail" TEXT;

-- Categorize BroadcastTemplate rows so the composer can group/filter them
ALTER TABLE "BroadcastTemplate" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general';

GRANT ALL ON TABLE "PlatformBroadcast" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "BroadcastTemplate" TO anon, authenticated, postgres, service_role;

-- Starter follow-up templates the CEO can load, edit, and reuse as-is
INSERT INTO "BroadcastTemplate" ("id", "name", "subject", "body", "category", "createdAt", "updatedAt") VALUES
(gen_random_uuid()::text, 'Personal Welcome', 'Welcome aboard, {{firstName}} — a personal note', E'Hi {{firstName}},\n\nI wanted to reach out personally and welcome you to AuthorLoft. I saw you just got your author site set up, and I''m genuinely excited to have you here.\n\nIf anything is confusing or you get stuck on your first steps, just reply to this email — it comes straight to me, not a support queue.\n\nLooking forward to seeing what you build.\n\n— Andy, Founder, AuthorLoft', 'welcome', now(), now()),
(gen_random_uuid()::text, 'Offering a Hand', 'Need a hand getting started, {{firstName}}?', E'Hi {{firstName}},\n\nI noticed you haven''t had a chance to finish setting things up yet — totally normal, and no pressure at all.\n\nIf you''re stuck on anything (adding your first book, picking a theme, connecting a domain), just reply here and tell me where you left off. I''m happy to walk you through it directly.\n\n— Andy, AuthorLoft', 'support', now(), now()),
(gen_random_uuid()::text, 'Special Offer', 'A little something for you, {{firstName}}', E'Hi {{firstName}},\n\nI wanted to personally pass along a limited-time offer for your account. [describe offer / discount / code here]\n\nThis one''s just for you — reply if you have any questions before it expires.\n\n— Andy, AuthorLoft', 'promotion', now(), now()),
(gen_random_uuid()::text, 'Just Checking In', 'Checking in, {{firstName}} — how''s it going?', E'Hi {{firstName}},\n\nIt''s been a little while, so I wanted to check in and see how things are going with your author site.\n\nIs there anything holding you back, or anything we could build that would make AuthorLoft more useful for you? I read every reply.\n\n— Andy, AuthorLoft', 're-engagement', now(), now());
