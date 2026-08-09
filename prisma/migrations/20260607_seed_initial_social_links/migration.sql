-- Seed initial company social links into PlatformSettings
UPDATE "PlatformSettings"
SET "socialLinks" = '[
  {
    "id": "social_linkedin",
    "platform": "LinkedIn",
    "url": "https://www.linkedin.com/company/authorloft/?viewAsMember=true",
    "icon": "linkedin",
    "sortOrder": 0
  },
  {
    "id": "social_facebook",
    "platform": "Facebook",
    "url": "https://www.facebook.com/profile.php?id=61589513229124",
    "icon": "facebook",
    "sortOrder": 1
  }
]'::jsonb
WHERE id = 'singleton';
