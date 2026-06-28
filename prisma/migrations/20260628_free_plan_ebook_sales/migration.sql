-- Enable direct eBook sales on the FREE plan
UPDATE "Plan" SET "salesEnabled" = true WHERE "tier" = 'FREE';

-- Enable bundles and courses on STANDARD and PREMIUM plans
-- (these features shipped June 27 but the plan flags were never set)
UPDATE "Plan" SET "bundlesEnabled" = true, "coursesEnabled" = true
WHERE "tier" IN ('STANDARD', 'PREMIUM');
