-- Founding Member designation — manually awarded by Super Admin
ALTER TABLE "Author" ADD COLUMN "isFoundingMember" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Author" ADD COLUMN "foundingMemberSince" TIMESTAMP(3);
