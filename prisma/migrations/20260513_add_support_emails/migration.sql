-- CreateTable
CREATE TABLE "SupportEmail" (
  "id"          TEXT NOT NULL,
  "label"       TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "description" TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportEmail_pkey" PRIMARY KEY ("id")
);

-- Grants
GRANT SELECT ON "public"."SupportEmail" TO anon;
GRANT SELECT ON "public"."SupportEmail" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."SupportEmail" TO service_role;
