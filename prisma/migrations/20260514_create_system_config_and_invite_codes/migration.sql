-- CreateTable SystemConfig
CREATE TABLE "SystemConfig" (
  "id" TEXT NOT NULL,
  "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
  "maintenanceMessage" TEXT NOT NULL DEFAULT '',
  "betaMode" BOOLEAN NOT NULL DEFAULT false,
  "betaMessage" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable InviteCode
CREATE TABLE "InviteCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT '',
  "maxUses" INTEGER NOT NULL DEFAULT 1,
  "usesCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

-- Insert default SystemConfig record
INSERT INTO "SystemConfig" ("id", "maintenanceMode", "maintenanceMessage", "betaMode", "betaMessage", "updatedAt")
VALUES ('main', false, '', false, '', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SystemConfig" TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."InviteCode" TO service_role;
