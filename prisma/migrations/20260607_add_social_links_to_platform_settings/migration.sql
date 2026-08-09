-- Add socialLinks JSON field to PlatformSettings for flexible company social media management
ALTER TABLE "PlatformSettings" ADD COLUMN "socialLinks" JSONB NOT NULL DEFAULT '[]';
