-- Fix BroadcastTemplate bodies: all 13 rows were plain text with literal
-- newlines and no markup, but the send pipeline (RichTextEditor composer +
-- mailer.ts buildPlatformBroadcastEmail) expects HTML -- Tiptap collapses
-- newlines per standard HTML whitespace rules, producing a run-on paragraph
-- with no bold/emphasis. Converts all 13 to real HTML.
--
-- Also fixes a real bug in the just-added social-promote-announcement
-- template: buildBroadcastMailPayload only substitutes {{firstName}}, not
-- {{dashboardUrl}} (that token is only supported by the separate Welcome
-- Email substituteVars() function) -- the email would have literally sent
-- "{{dashboardUrl}}" as text. Replaced with a real static link, since
-- /admin/promote is a platform route, not a per-author subdomain.
--
-- The 6 onboarding templates also used [AUTHOR_NAME] bracket placeholders
-- that were never wired to any substitution -- converted to {{firstName}}.
-- Other bracket placeholders referencing links/data that don't exist
-- (a video walkthrough, pre-made graphics, a scheduled workshop) are left
-- as explicit [TODO: ...] markers rather than fabricated. Day 7 and Day 14
-- additionally contained specific "real" sales/visitor numbers attributed
-- to unnamed authors and a "Real example" case study -- none of this is
-- real data, so those sections are marked [TODO] rather than shipped as
-- fact. Recommend a full editorial pass on Day 7 / Day 14 before ever
-- sending them.

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>I wanted to reach out personally to say thank you for joining AuthorLoft during our early launch.</p>
<p>Having you as one of our first members means a lot — you're helping shape what AuthorLoft becomes.</p>
<p>If you have any feedback — features you'd love to see, anything that's confusing, or things that aren't working — please just reply to this email. <strong>I read every message.</strong></p>
<p>Thank you again for being here.</p>
<p>— Andy<br>AuthorLoft Founder</p>$body$ WHERE id = 'cmp8f9kya0000l404got6j3su';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Upgrade Your Author Website With 20% Off Your First Annual Subscription</strong><br>
(or save with a discounted 3-month start on any monthly plan.)</p>
<p>Professional storefronts for authors, direct sales, reader capture, ebooks, audiobooks, ARC management, and the tools indie authors actually need, all in one place.</p>
<p><strong><a href="https://www.authorloft.com/admin/settings?tab=billing">Start building with AuthorLoft</a></strong></p>
<hr>
<p><strong>Your books deserve a real home</strong></p>
<p>You already know the problem. Social platforms change constantly, marketplaces own your customer data, and most "author websites" feel disconnected from the business side of publishing.</p>
<p>AuthorLoft was built to give authors a clean, professional storefront that feels modern, trusted, and easy for readers to buy from.</p>
<p>No patchwork tools. No complicated setup. Just a place that finally feels built for authors first.</p>
<hr>
<p><strong>What's inside</strong></p>
<p><strong>Direct book sales</strong><br>
Sell ebooks, audiobooks, signed copies, and retail links from one branded storefront while keeping control of your audience and customer relationships.</p>
<p><strong>Professional themes designed for authors</strong><br>
Genre-focused layouts, customizable branding, reader-focused pages, and a polished experience that helps visitors stay longer and convert.</p>
<p><strong>Tools that grow with you</strong><br>
Email features, ARC management, AI assistance, pricing controls, and scalable plans whether you're launching your first novel or managing a full catalog.</p>
<p><strong><a href="https://www.authorloft.com/admin/settings?tab=billing">Start Here — get 20% off your first annual subscription</a></strong><br>
or unlock savings on your first 3 months of monthly billing.</p>
<p>Join the next wave of indie authors building direct reader relationships.</p>
<p>No additional setup. Big difference in how readers experience your brand.</p>
<p><strong>Built for authors. Powered by AuthorLoft.</strong></p>$body$ WHERE id = 'cmpfjvt1o0000js04ly19j6rd';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>I wanted to reach out personally and welcome you to AuthorLoft. I saw you just got your author site set up, and I'm genuinely excited to have you here.</p>
<p>If anything is confusing or you get stuck on your first steps, just reply to this email — <strong>it comes straight to me, not a support queue.</strong></p>
<p>Looking forward to seeing what you build.</p>
<p>— Andy, Founder, AuthorLoft</p>$body$ WHERE id = '8bb836f9-15be-45b5-af85-48727f6e9d3a';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>I noticed you haven't had a chance to finish setting things up yet — totally normal, and no pressure at all.</p>
<p>If you're stuck on anything (adding your first book, picking a theme, connecting a domain), just reply here and tell me where you left off. <strong>I'm happy to walk you through it directly.</strong></p>
<p>— Andy, AuthorLoft</p>$body$ WHERE id = '288d9a80-c482-4a5e-bd4a-c2575b5ff10a';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>I wanted to personally pass along a limited-time offer for your account. <strong>[describe offer / discount / code here]</strong></p>
<p>This one's just for you — reply if you have any questions before it expires.</p>
<p>— Andy, AuthorLoft</p>$body$ WHERE id = '8970c9a9-77df-47a5-a170-d6efc6625709';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>It's been a little while, so I wanted to check in and see how things are going with your author site.</p>
<p>Is there anything holding you back, or anything we could build that would make AuthorLoft more useful for you? <strong>I read every reply.</strong></p>
<p>— Andy, AuthorLoft</p>$body$ WHERE id = '892bb196-deec-4186-806f-3494a6297cce';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>Quick one — there's a tool in your dashboard you probably haven't seen yet: <strong>Promote</strong>.</p>
<p>Pick a book, pick a platform (Facebook, Instagram, X, LinkedIn, TikTok, and a few more), pick an angle — new release, sale, milestone, whatever fits — and it drafts a ready-to-post caption using your book's actual details. Not generic AI filler, your book, your voice.</p>
<p>No scheduling, no connecting your accounts, no OAuth headaches. You copy the text, you paste it wherever you post. That's it.</p>
<p><strong>It's already included on your plan</strong> — nothing to turn on, nothing extra to pay for.</p>
<p><strong><a href="https://www.authorloft.com/admin/promote">Try Promote now</a></strong></p>
<p>Takes about a minute to generate your first post. Let us know what you think — reply to this email, we read every one.</p>
<p>— The AuthorLoft Team</p>$body$ WHERE id = 'social-promote-announcement';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Welcome to AuthorLoft! 🎉</strong></p>
<p>You're joining hundreds of authors who are taking control of their book sales, reader connections, and author brand — all on their own terms.</p>
<p>Here's what you can do right now:</p>
<p><strong>1. Complete your author profile</strong> (2 min)<br>
Add your photo, bio, and social links. This is what readers see first.</p>
<p><strong>2. Upload your first book</strong> (5 min)<br>
Add title, cover, synopsis, and price. Your site starts coming to life here.</p>
<p><strong>3. Set up your newsletter</strong> (3 min)<br>
Capture reader emails at checkout. Turn one-time buyers into fans.</p>
<p><strong>Your next step:</strong> <a href="https://www.authorloft.com/admin/branding">Start Your Profile</a></p>
<p>Questions? Reply to this email — I read every message.</p>
<p>Best,<br>The AuthorLoft Team</p>
<p>P.S. Your first book upload is completely free on any plan. No limits. 📚</p>$body$ WHERE id = 'onboarding-day0';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>Yesterday you signed up. Today I want to show you something that might surprise you:</p>
<p><strong>Authors using AuthorLoft are selling books in their first week.</strong></p>
<p>Here's why: instead of waiting for a website developer, you can publish your first book and start selling today — not in months.</p>
<p>Three things that take less than 10 minutes:</p>
<p>✓ Upload 1 book (cover + price)<br>
✓ Customize your site colors<br>
✓ Share your public author link with readers</p>
<p>Once you upload a book, you'll see your live site immediately at your AuthorLoft subdomain.</p>
<p><strong>See your site now:</strong> <a href="https://www.authorloft.com/admin/books/new">Upload Your First Book</a></p>
<p>The authors who do this today? They're the ones seeing readers buy this week.</p>
<p>— The AuthorLoft Team</p>
<p>P.S. Forgot how to get started? <strong>[TODO: link to a 3-min video walkthrough — none exists yet]</strong></p>$body$ WHERE id = 'onboarding-day1';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Great progress! Your first book is live.</strong></p>
<p>Now comes the exciting part: getting it in front of readers.</p>
<p>Three readers-per-week strategies that work:</p>
<p><strong>1. Share your link on social</strong> (60 seconds)<br>
Use our pre-made graphics: <strong>[TODO: link to graphics — none exist yet]</strong><br>
Your readers already follow you there.</p>
<p><strong>2. Send your first newsletter</strong> (5 minutes)<br>
Email the readers you captured at signup.<br>
Pro tip: share a behind-the-scenes story, not just "buy my book."</p>
<p><strong>3. Add your second book</strong> (even a free short story)<br>
More books = more reasons for readers to stay.</p>
<p>Which one feels easiest to you? Start there.</p>
<p>→ <a href="https://www.authorloft.com/admin/dashboard">Share your site</a><br>
→ <a href="https://www.authorloft.com/admin/newsletter">Send first newsletter</a></p>
<p>You're 10 minutes away from reader-traffic. Let's go.</p>
<p>— The AuthorLoft Team</p>$body$ WHERE id = 'onboarding-day3-completed';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p>I noticed you signed up 3 days ago but haven't uploaded your first book yet.</p>
<p>That's totally normal — most authors hit a small snag somewhere in setup. I want to help unblock you because I know what's on the other side:</p>
<p><strong>Your site is ready. Your readers are waiting.</strong></p>
<p>Common blockers (and 30-second fixes):</p>
<p>❌ "I'm not sure which book to start with"<br>
→ Start with your most recent or bestselling title (you can add others later)</p>
<p>❌ "My book cover isn't perfect yet"<br>
→ Use our cover templates or upload a low-res version — you can update it anytime</p>
<p>❌ "I don't know what to charge"<br>
→ Use our pricing benchmark tool, or see what similar authors charge <strong>[TODO: link — none exists yet]</strong></p>
<p>❌ "I'm nervous about the technical side"<br>
→ There's no technical part. Upload cover + set price. Done.</p>
<p>Here's what I'd like: Take 5 minutes right now to upload one book — even a short story or free preview. Then reply to this email and tell me what happens. I'll personally celebrate with you and give you the next steps.</p>
<p>→ <a href="https://www.authorloft.com/admin/books/new">Upload your first book</a></p>
<p>You're one book upload away from being live.</p>
<p>— [Support Team Name]<br>
I'm here to help. Just reply.</p>$body$ WHERE id = 'onboarding-day3-trigger';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Real data from real AuthorLoft authors this week:</strong> <em>[TODO: replace with real, current author stats before sending — the names/numbers below are placeholder examples, not real data]</em></p>
<p>📊 47 sales | [Author Name] (7 days, 1 book)<br>
📊 23 newsletter signups | [Author Name] (first newsletter)<br>
📊 156 site visitors | [Author Name] (social shares)</p>
<p>Here's the pattern: the authors seeing early traction did 3 things:</p>
<p>1. ✅ Published 1 book (done — nice work!)<br>
2. ✅ Shared with 5+ people (one LinkedIn post = 20+ views)<br>
3. ✅ Set up newsletter capture (readers opt in at checkout)</p>
<p><strong>Your next move?</strong></p>
<p>If you haven't already:<br>
☐ Share your author link on social (1 minute)<br>
☐ Enable newsletter capture (2 clicks)<br>
☐ Consider uploading your second book (5 minutes — readers love variety)</p>
<p>The authors seeing 30+ visitors this week? Most uploaded 2+ books.</p>
<p>→ <a href="https://www.authorloft.com/admin/books/new">Upload another book</a><br>
→ <a href="https://www.authorloft.com/admin/newsletter">Turn on newsletter signup</a></p>
<p>You're building something real here.</p>
<p>— The AuthorLoft Team</p>
<p>P.S. Ready to go premium? Here's what unlocks at $12/mo: custom domain + flip-book previews + deeper analytics. <a href="https://www.authorloft.com/pricing">Learn more</a></p>$body$ WHERE id = 'onboarding-day7';

UPDATE "BroadcastTemplate" SET "updatedAt" = NOW(), body = $body$<p>Hi {{firstName}},</p>
<p><strong>Two weeks in — let's check progress:</strong></p>
<p>Your AuthorLoft site: <em>[TODO: no live per-recipient stats merge-field exists yet — this section needs a real feature built, or should be rewritten as generic copy]</em><br>
- Books published: [COUNT]<br>
- Site visitors: [COUNT]<br>
- Newsletter signups: [COUNT]</p>
<p>You're off to a solid start. Here's where most authors accelerate:</p>
<p><strong>Free → Standard ($12/mo) = More Readers, More Sales</strong></p>
<p><strong>Feature Comparison:</strong><br>
- Custom domain: Free = No | Standard = Yes — looks professional, drives trust<br>
- Flip-book previews: Free = No | Standard = Yes — 45% higher book preview engagement<br>
- Advanced analytics: Free = No | Standard = Yes — know which readers become buyers<br>
- Books: Free = 5 max | Standard = Unlimited — publish your whole catalog<br>
- Digital sales: Free = No | Standard = Yes — keep more per sale (lower fees)</p>
<p><em>[TODO: "Real example" below is placeholder copy, not a verified case study — replace with a real author example or remove before sending]</em><br>
Real example: One author upgraded to Standard, added their 3-book series, and went from $140 in sales (week 1) to $1,200 (week 3). Same readers — better experience.</p>
<p><strong>Or Stay Free</strong></p>
<p>No pressure. Free plan works great for:<br>
- Testing the platform<br>
- Single book launched<br>
- Email-only reader capture</p>
<p>One more thing: <strong>[TODO: "Author Success Stories" workshop — no such event is scheduled; remove this paragraph or replace with a real one before sending]</strong></p>
<p>→ <a href="https://www.authorloft.com/pricing">Upgrade to Standard</a><br>
→ Attend the workshop (FREE): <strong>[TODO: no event/calendar link exists]</strong><br>
→ <a href="https://www.authorloft.com/admin/dashboard">Keep exploring on Free</a></p>
<p>You're doing the hard part — writing and publishing. We're here to handle the rest.</p>
<p>Questions? Just reply.</p>
<p>— The AuthorLoft Team</p>
<p>P.S. Standard members who reach 50 newsletter subscribers get a featured spot in our "Author Spotlight" email (10,000+ readers). Not bad, right?</p>$body$ WHERE id = 'onboarding-day14';
