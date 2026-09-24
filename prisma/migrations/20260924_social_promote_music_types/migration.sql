-- Data-only: music-specific Social Promote promo types (applicableContexts =
-- ['music']). The existing types are all written around {{book.title}}.
-- Super Admin can edit/deactivate these like any other promo type.
-- ON CONFLICT keeps re-running this harmless.
INSERT INTO "SocialPromoType" ("id", "slug", "name", "description", "promptTemplate", "applicableContexts", "applicablePlatforms", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('promo_music_new_release', 'music-new-release', 'New Music Release',
 'Announce an album, EP, single or playlist.',
 'Write a social post from {{author.displayName}} announcing their {{music.type}} "{{music.title}}". Name one or two specific tracks from the track list, capture the mood or story behind the music using only what''s in the author data, and invite people to listen. Include this link on its own line: {{music.url}} — except on Instagram or TikTok, where links aren''t clickable: say the link is in the bio instead and leave the URL out.',
 ARRAY['music'], ARRAY[]::text[], true, 15, now(), now()),
('promo_music_track_spotlight', 'music-track-spotlight', 'Track Spotlight',
 'Focus on one song from the release.',
 'Write a social post from {{author.displayName}} spotlighting ONE track from "{{music.title}}". Pick the track from the track list whose title gives the most to work with, and build the post around that song alone. Invite people to give it a listen. Include this link on its own line: {{music.url}} — except on Instagram or TikTok, where links aren''t clickable: say the link is in the bio instead and leave the URL out.',
 ARRAY['music'], ARRAY[]::text[], true, 16, now(), now()),
('promo_music_behind_the_music', 'music-behind-the-music', 'Behind the Music',
 'A personal, behind-the-scenes angle on the release.',
 'Write a personal, behind-the-scenes social post from {{author.displayName}} about making "{{music.title}}". Ground it in the release description; if it doesn''t say how the music was made, talk about what the music means to them instead of inventing studio details. Close by inviting people to listen. Include this link on its own line: {{music.url}} — except on Instagram or TikTok, where links aren''t clickable: say the link is in the bio instead and leave the URL out.',
 ARRAY['music'], ARRAY[]::text[], true, 17, now(), now()),
('promo_music_listen_prompt', 'music-listen-prompt', 'Ask Listeners',
 'Start a conversation: which track is their favourite?',
 'Write an engagement-focused social post from {{author.displayName}} about "{{music.title}}" that asks listeners a question, such as which track is their favourite or which one they''d play on a road trip. Keep it short and conversational so people reply. Include this link on its own line: {{music.url}} — except on Instagram or TikTok, where links aren''t clickable: say the link is in the bio instead and leave the URL out.',
 ARRAY['music'], ARRAY[]::text[], true, 18, now(), now())
ON CONFLICT ("slug") DO NOTHING;
