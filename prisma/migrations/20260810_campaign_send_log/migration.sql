-- CreateTable: CampaignSendLog
-- Per-recipient send record, correlated to Resend's email.opened/email.clicked
-- webhook events via resendEmailId. Powers newsletter open/click analytics.
CREATE TABLE "CampaignSendLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberEmail" TEXT NOT NULL,
    "resendEmailId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "firstClickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSendLog_resendEmailId_key" ON "CampaignSendLog"("resendEmailId");
CREATE INDEX "CampaignSendLog_campaignId_idx" ON "CampaignSendLog"("campaignId");

-- AddForeignKey
ALTER TABLE "CampaignSendLog" ADD CONSTRAINT "CampaignSendLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grants: all new tables need RLS grants for the build check
GRANT ALL ON TABLE "CampaignSendLog" TO anon, authenticated, postgres, service_role;
