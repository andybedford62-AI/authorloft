ALTER TABLE "ContactMessage"
  ADD COLUMN "hasBeenReplied" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastRepliedAt" TIMESTAMP(3);

GRANT ALL ON TABLE "ContactMessage" TO anon, authenticated, postgres, service_role;
