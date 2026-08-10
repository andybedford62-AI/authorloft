-- Email-DoS audit (Aug 10, 2026): forgot-password was rate-limited by IP
-- only (5 req/15min), which a rotating-IP attacker can bypass to bomb one
-- victim's inbox with password-reset emails. Adds an email-keyed cooldown
-- independent of IP.

ALTER TABLE "Author" ADD COLUMN "passwordResetLastSentAt" TIMESTAMP(3);
