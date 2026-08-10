-- Resend cooldown for double opt-in confirmation emails. Without this, every
-- resubmission of an unconfirmed email (by the same person retrying, or by
-- someone else entering that email maliciously) regenerated a token and sent
-- a fresh confirmation email -- the only guard was a coarse 10-req/hour-per-IP
-- rate limiter, which doesn't stop a targeted inbox from being spammed.
-- Flagged by Andy.

ALTER TABLE "PlatformSubscriber" ADD COLUMN "lastConfirmationSentAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN "lastConfirmationSentAt" TIMESTAMP(3);
