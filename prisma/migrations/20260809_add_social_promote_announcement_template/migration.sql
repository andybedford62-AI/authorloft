-- AuthorLoft Social Promote announcement template
-- Social Promote has been fully built and live since June 20, 2026 but saw
-- essentially zero real usage since (verified via GeneratedSocialPost:
-- 6 rows, 1 author, nothing since June 21) -- a discovery gap, not a build
-- gap. This adds a selectable Mass Email template announcing it to
-- Standard/Premium authors. Uses {{firstName}}/{{dashboardUrl}} tokens
-- (mailer.ts's case-insensitive substitution), matching the individual/
-- mass email system rather than the older [BRACKET] placeholder style
-- used by the onboarding sequence templates.

INSERT INTO "BroadcastTemplate" (id, name, subject, body, category, "createdAt", "updatedAt") VALUES
  (
    'social-promote-announcement',
    'Announcement: Social Promote (AI post generator)',
    'Let AI draft your next social post (new, included in your plan)',
    'Hi {{firstName}},

Quick one — there''s a tool in your dashboard you probably haven''t seen yet: Promote.

Pick a book, pick a platform (Facebook, Instagram, X, LinkedIn, TikTok, and a few more), pick an angle — new release, sale, milestone, whatever fits — and it drafts a ready-to-post caption using your book''s actual details. Not generic AI filler, your book, your voice.

No scheduling, no connecting your accounts, no OAuth headaches. You copy the text, you paste it wherever you post. That''s it.

It''s already included on your plan — nothing to turn on, nothing extra to pay for.

Try it now: {{dashboardUrl}} → Tools → Promote

Takes about a minute to generate your first post. Let us know what you think — reply to this email, we read every one.

— The AuthorLoft Team',
    'promotion',
    NOW(),
    NOW()
  );
