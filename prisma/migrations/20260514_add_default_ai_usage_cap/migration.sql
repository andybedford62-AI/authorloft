-- Add defaultAiUsageCap to SystemConfig
ALTER TABLE "SystemConfig" ADD COLUMN IF NOT EXISTS "defaultAiUsageCap" INTEGER NOT NULL DEFAULT 20;
