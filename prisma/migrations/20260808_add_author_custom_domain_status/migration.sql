ALTER TABLE "Author" ADD COLUMN "customDomainStatus" TEXT;
ALTER TABLE "Author" ADD COLUMN "customDomainVerification" JSONB;
ALTER TABLE "Author" ADD COLUMN "customDomainAddedAt" TIMESTAMP(3);
