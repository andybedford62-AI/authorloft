-- BroadcastTemplate list was sorted by updatedAt desc, which reshuffles the
-- entire "Load template" list every time any row is edited -- exactly what
-- happened after today's formatting fixes touched all 13 rows at once.
-- Adds a stable sortOrder: onboarding templates in their real Day 0->14
-- sequence, other templates grouped by category in a natural lifecycle
-- order (welcome -> support -> promotion -> re-engagement -> general).

ALTER TABLE "BroadcastTemplate" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "BroadcastTemplate" SET "sortOrder" = 10 WHERE id = 'onboarding-day0';
UPDATE "BroadcastTemplate" SET "sortOrder" = 20 WHERE id = 'onboarding-day1';
UPDATE "BroadcastTemplate" SET "sortOrder" = 30 WHERE id = 'onboarding-day3-completed';
UPDATE "BroadcastTemplate" SET "sortOrder" = 31 WHERE id = 'onboarding-day3-trigger';
UPDATE "BroadcastTemplate" SET "sortOrder" = 40 WHERE id = 'onboarding-day7';
UPDATE "BroadcastTemplate" SET "sortOrder" = 50 WHERE id = 'onboarding-day14';

UPDATE "BroadcastTemplate" SET "sortOrder" = 100 WHERE id = '8bb836f9-15be-45b5-af85-48727f6e9d3a'; -- Personal Welcome (welcome)
UPDATE "BroadcastTemplate" SET "sortOrder" = 110 WHERE id = '288d9a80-c482-4a5e-bd4a-c2575b5ff10a'; -- Offering a Hand (support)
UPDATE "BroadcastTemplate" SET "sortOrder" = 120 WHERE id = '8970c9a9-77df-47a5-a170-d6efc6625709'; -- Special Offer (promotion)
UPDATE "BroadcastTemplate" SET "sortOrder" = 121 WHERE id = 'social-promote-announcement';          -- Announcement: Social Promote (promotion)
UPDATE "BroadcastTemplate" SET "sortOrder" = 130 WHERE id = '892bb196-deec-4186-806f-3494a6297cce'; -- Just Checking In (re-engagement)
UPDATE "BroadcastTemplate" SET "sortOrder" = 140 WHERE id = 'cmp8f9kya0000l404got6j3su';             -- Thank you for being an early member (general)
UPDATE "BroadcastTemplate" SET "sortOrder" = 141 WHERE id = 'cmpfjvt1o0000js04ly19j6rd';             -- Upgrade 20% Savings (general)

-- Names for Day 7/14 no longer matched their rewritten content (the
-- previous migration dropped the "Social Proof"/"Premium Upsell" framing).
UPDATE "BroadcastTemplate" SET name = 'Onboarding Day 7: Encouragement + Feature Highlight', "updatedAt" = NOW() WHERE id = 'onboarding-day7';
UPDATE "BroadcastTemplate" SET name = 'Onboarding Day 14: Standard Upgrade Nudge', "updatedAt" = NOW() WHERE id = 'onboarding-day14';
