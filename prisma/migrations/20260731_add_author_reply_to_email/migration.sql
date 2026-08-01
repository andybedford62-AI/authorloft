ALTER TABLE "SystemConfig" ADD COLUMN "authorReplyToEmail" TEXT;
GRANT ALL ON TABLE "SystemConfig" TO anon, authenticated, postgres, service_role;
