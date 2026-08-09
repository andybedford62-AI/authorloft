-- AuthorLoft Onboarding Email Templates
-- Insert 5 predetermined emails for new author onboarding sequence

INSERT INTO "BroadcastTemplate" (id, name, subject, body, category, "createdAt", "updatedAt") VALUES
  (
    'onboarding-day0',
    'Onboarding Day 0: Welcome + First Steps',
    'Your AuthorLoft author website is ready to set up',
    'Hi [AUTHOR_NAME],

Welcome to AuthorLoft! 🎉

You''re joining hundreds of authors who are taking control of their book sales, reader connections, and author brand—all on their own terms.

Here''s what you can do right now:

1. Complete your author profile (2 min)
   Add your photo, bio, and social links. This is what readers see first

2. Upload your first book (5 min)
   Add title, cover, synopsis, and price. Your site starts coming to life here

3. Set up your newsletter (3 min)
   Capture reader emails at checkout. Turn one-time buyers into fans

Your next step: [CTA BUTTON: Start Your Profile]

Questions? Reply to this email—I read every message.

Best,
The AuthorLoft Team

P.S. Your first book upload is completely free on any plan. No limits. 📚',
    'onboarding',
    NOW(),
    NOW()
  ),
  (
    'onboarding-day1',
    'Onboarding Day 1: Quick Wins + Social Proof',
    'See your author site in 10 minutes',
    'Hi [AUTHOR_NAME],

Yesterday you signed up. Today I want to show you something that might surprise you:

Authors using AuthorLoft are selling books in their first week.

Here''s why: instead of waiting for a website developer, you can publish your first book and start selling today—not in months.

Three things that take less than 10 minutes:

✓ Upload 1 book (cover + price)
✓ Customize your site colors
✓ Share your public author link with readers

Once you upload a book, you''ll see your live site immediately at [SUBDOMAIN].authorloft.com.

See your site now: [CTA BUTTON: Upload Your First Book]

The authors who do this today? They''re the ones seeing readers buy this week.

—The AuthorLoft Team

P.S. Forgot how to get started? [Link to 3-min video walkthrough]',
    'onboarding',
    NOW(),
    NOW()
  ),
  (
    'onboarding-day3-completed',
    'Onboarding Day 3: Activation (for completers)',
    'Your first reader is waiting to find you',
    'Hi [AUTHOR_NAME],

Great progress! Your first book is live.

Now comes the exciting part: getting it in front of readers.

Three readers-per-week strategies that work:

1. Share your link on social (60 seconds)
   Use our pre-made graphics: [Link]
   Your readers already follow you there

2. Send your first newsletter (5 minutes)
   Email the readers you captured at signup
   Pro tip: share a behind-the-scenes story, not just "buy my book"

3. Add your second book (even a free short story)
   More books = more reasons for readers to stay

Which one feels easiest to you? Start there.

→ Share your site: [Social sharing links]
→ Send first newsletter: [Dashboard link]

You''re 10 minutes away from reader-traffic. Let''s go.

—The AuthorLoft Team',
    'onboarding',
    NOW(),
    NOW()
  ),
  (
    'onboarding-day3-trigger',
    'Onboarding Day 3: Behavioral Trigger (for non-completers)',
    '[AUTHOR_NAME], we created this for authors like you—let''s fix the blockers',
    'Hi [AUTHOR_NAME],

I noticed you signed up 3 days ago but haven''t uploaded your first book yet.

That''s totally normal—most authors hit a small snag somewhere in setup. I want to help unblock you because I know what''s on the other side:

Your site is ready. Your readers are waiting.

Common blockers (and 30-second fixes):

❌ "I''m not sure which book to start with"
→ Start with your most recent or bestselling title (you can add others later)

❌ "My book cover isn''t perfect yet"
→ Use our cover templates or upload a low-res version—you can update it anytime

❌ "I don''t know what to charge"
→ Use our pricing benchmark tool, or see what similar authors charge [Link]

❌ "I''m nervous about the technical side"
→ There''s no technical part. Upload cover + set price. Done.

Here''s what I''d like: Take 5 minutes right now to upload one book—even a short story or free preview. Then reply to this email and tell me what happens. I''ll personally celebrate with you and give you the next steps.

→ Upload your first book: [CTA BUTTON: Start Now]

You''re one book upload away from being live.

—[Support Team Name]
I''m here to help. Just reply.',
    'onboarding',
    NOW(),
    NOW()
  ),
  (
    'onboarding-day7',
    'Onboarding Day 7: Social Proof + Feature Highlight',
    'How [SUCCESSFUL_AUTHOR] went from 0 to 47 sales in 7 days',
    'Hi [AUTHOR_NAME],

Real data from real AuthorLoft authors this week:

📊 47 sales | [Author Name] (7 days, 1 book)
📊 23 newsletter signups | [Author Name] (first newsletter)
📊 156 site visitors | [Author Name] (social shares)

Here''s the pattern: The authors seeing early traction did 3 things:

1. ✅ Published 1 book (done—nice work!)
2. ✅ Shared with 5+ people (one LinkedIn post = 20+ views)
3. ✅ Set up newsletter capture (readers opt in at checkout)

Your next move?

If you haven''t already:
☐ Share your author link on social (1 minute)
☐ Enable newsletter capture (2 clicks)
☐ Consider uploading your second book (5 minutes—readers love variety)

The authors seeing 30+ visitors this week? Most uploaded 2+ books.

→ Upload another book: [CTA BUTTON]
→ Turn on newsletter signup: [Dashboard link]

You''re building something real here.

—The AuthorLoft Team

P.S. Ready to go premium? Here''s what unlocks at $12/mo: custom domain + flip-book previews + deeper analytics. [Learn more]',
    'onboarding',
    NOW(),
    NOW()
  ),
  (
    'onboarding-day14',
    'Onboarding Day 14: Premium Upsell + Retention Check',
    'Take AuthorLoft to the next level (and keep more of your sales)',
    'Hi [AUTHOR_NAME],

Two weeks in—let''s check progress:

Your AuthorLoft site: [Personalized stats]
- Books published: [COUNT]
- Site visitors: [COUNT]
- Newsletter signups: [COUNT]

You''re off to a solid start. Here''s where most authors accelerate:

Free → Standard ($12/mo) = More Readers, More Sales

Feature Comparison:
- Custom domain: Free = No | Standard = Yes | Why = Looks professional; drives trust
- Flip-book previews: Free = No | Standard = Yes | Why = 45% higher book preview engagement
- Advanced analytics: Free = No | Standard = Yes | Why = Know which readers become buyers
- Books: Free = 5 max | Standard = Unlimited | Why = Publish your whole catalog
- Digital sales: Free = No | Standard = Yes | Why = Keep more per sale (lower fees)

Real example: One author upgraded to Standard, added their 3-book series, and went from $140 in sales (week 1) to $1,200 (week 3). Same readers—better experience.

Or Stay Free

No pressure. Free plan works great for:
- Testing the platform
- Single book launched
- Email-only reader capture

One more thing: You''re invited to our "Author Success Stories" workshop tomorrow (48 hours access). Other AuthorLoft authors share their exact playbook: how they got their first 100 readers, priced their books, and grew their list.

→ Upgrade to Standard: [CTA BUTTON + pricing link]
→ Attend the workshop (FREE): [Link + calendar invite]
→ Keep exploring on Free: [Dashboard link]

You''re doing the hard part—writing and publishing. We''re here to handle the rest.

Questions? Just reply.

—The AuthorLoft Team

P.S. Standard members who reach 50 newsletter subscribers get a featured spot in our "Author Spotlight" email (10,000+ readers). Not bad, right?',
    'onboarding',
    NOW(),
    NOW()
  );
