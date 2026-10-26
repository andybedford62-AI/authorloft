# SEO merge plan: three merges (draft for review, nothing applied)

Source: `c_thin` (worth 1.2) in the 21 Oct 2026 heycatch SEO audit. Text below reuses only what the current pages already say. Unsourced statistics from the old pages are dropped, and where the old text made a claim I could not verify I say so.

## What happens in each merge
| Target (stays, text rewritten) | Merged in (unpublished + 301) | New length |
|---|---|---|
| `author-website-homepage-checklist` | `author-website-mistakes`, `best-author-website-examples` | about 800 words |
| `what-is-authorloft` | `getting-started-guide` | about 700 words |
| `building-your-first-author-email-list` | `welcome-email-sequence-for-authors`, `reader-magnets-explained` | about 850 words |

Changes from my earlier outline: the checklist guide is the target (not `best-author-website-examples`) because the merged text is a checklist and its title already says so.

## Redirect plan (`next.config.ts`, same shape as the existing six)
```ts
{ source: "/guides/author-website-mistakes",          destination: "/guides/author-website-homepage-checklist",    permanent: true },
{ source: "/guides/best-author-website-examples",     destination: "/guides/author-website-homepage-checklist",    permanent: true },
{ source: "/guides/getting-started-guide",           destination: "/guides/what-is-authorloft",                   permanent: true },
{ source: "/guides/welcome-email-sequence-for-authors", destination: "/guides/building-your-first-author-email-list", permanent: true },
{ source: "/guides/reader-magnets-explained",        destination: "/guides/building-your-first-author-email-list", permanent: true },
```

## Order of work (same as last time, so nothing 404s)
1. You approve the text below (edit anything).
2. I write the redirects into `next.config.ts`, show the diff, you approve, I commit and push to `dev`.
3. You promote to production.
4. After production shows the redirects, I (a) update the three target guides in the database (content, FAQs, excerpt, meta description, related slugs), saving the old values for rollback, and (b) set `isPublished = false` on the five merged pages.
5. I repoint the internal links listed below.

## Internal references to fix
- `src/lib/landing-page-data.tsx:107` lists `best-author-website-examples` and `author-website-homepage-checklist` in `relatedGuideSlugs`. Unpublished guides are skipped there, so only the first one disappears; no code change is required, but I would remove `best-author-website-examples`.
- Guide `build-your-first-website` lists `author-website-homepage-checklist` and `author-website-mistakes` as related. Remove the mistakes slug.
- Guide `authorloft-vs-bookfunnel` lists `reader-magnets-explained` as related. Repoint to `building-your-first-author-email-list`.
- Guide `getting-started-guide` links to the checklist in its text (it goes away with the page).
- Post `3-reader-magnets-that-grow-email-list` links to `/guides/reader-magnets-explained`. Repoint to `/guides/building-your-first-author-email-list`.
- Guide `welcome-email-sequence-for-authors` lists `reader-magnets-explained` (goes away with the page).

## Merge 1: `author-website-homepage-checklist`
**New SEO title:** Author Website Checklist: What to Fix First
**Excerpt:** A short checklist for your author website, the mistakes that cost the most readers, and the layout strong author sites follow.
**Meta description:** A checklist for your author website homepage, the most common mistakes that lose readers, and the layout that turns visitors into readers and subscribers.

```html
<h2>What should an author website homepage do?</h2>
<p>An author website homepage has one job: tell a new visitor who you are, what you write, and what to do next, in under five seconds. Most traffic from social media, search or a word-of-mouth recommendation lands on the homepage first, so a visitor who cannot tell what to do next leaves before they see your books.</p>

<h2>What goes on the homepage? A ten-point checklist</h2>
<ol>
<li><strong>Your name and genre, above the fold.</strong> No guessing.</li>
<li><strong>Your latest or featured book,</strong> with a cover image and a buy link.</li>
<li><strong>One main call to action,</strong> such as "Get the book" or "Join the list". Not five competing buttons.</li>
<li><strong>A newsletter signup,</strong> visible without scrolling if possible.</li>
<li><strong>A short bio teaser:</strong> a sentence or two, linked to your About page.</li>
<li><strong>Social proof,</strong> such as reviews, awards or press mentions, if you have them.</li>
<li><strong>Recent blog posts or news,</strong> so the site looks active.</li>
<li><strong>A mobile-friendly layout.</strong> Most visitors will see your site on a phone.</li>
<li><strong>A fast load time.</strong> Large, uncompressed images slow the page and hurt search ranking.</li>
<li><strong>Working navigation</strong> with Books, About and Contact clearly visible.</li>
</ol>

<h2>Which author website mistakes cost the most readers?</h2>
<p>Most author sites lose readers to a handful of small, fixable problems, not one big flaw. Fixing them is usually faster than getting more traffic.</p>
<ul>
<li><strong>No clear call to action on the homepage.</strong> Visitors do not know what to do next, so they leave.</li>
<li><strong>Books buried more than one click deep.</strong> Link your catalog from the main navigation.</li>
<li><strong>A hidden or missing newsletter signup.</strong> It is the highest-value action on your site and is often left out.</li>
<li><strong>Slow pages from oversized images.</strong> Every extra second of load time increases bounce rate.</li>
<li><strong>Outdated content.</strong> An "upcoming release" banner for a book that already launched looks like neglect.</li>
<li><strong>No mobile layout.</strong> A desktop-only page loses phone visitors right away.</li>
<li><strong>A generic, copy-paste bio.</strong> See our <a href="/guides/author-voice-finding-and-keeping-it">author voice guide</a> for how to fix it.</li>
</ul>

<h2>What does a strong author website layout look like?</h2>
<p>Author sites that work tend to follow the same order: hero with your name, genre and featured book, then a newsletter signup, a preview of your book catalog, an About teaser, recent blog posts, and a footer with social links. The order matches how readers scan a page, from a big first impression down to a low-commitment action (subscribing) before anyone asks for a purchase.</p>
<p>Other traits of sites that work: a book catalog that looks like a shelf with covers, blurbs and buy links, not a wall of text; an About page with a real photo of you, not a stock image; a newsletter signup in more than one place (homepage, footer, after blog posts); and a blog or news section, which gives search engines fresh pages to index.</p>
<p>A catalog linked from the main navigation and featured on the homepage will convert better than the same catalog hidden in a dropdown menu.</p>

<h2>How do I check my own site in five minutes?</h2>
<p>Open your site on your phone. Time how long it takes to find your latest book and buy it. If it takes more than two taps, fix that first. Then check whether a newsletter signup is visible without scrolling. If not, add one.</p>
```

**Needs you:** the title of the old page promised "examples". The merged text has no named real sites. If you want it, add 2-3 real author sites you can name and describe.
**FAQs (merged, 5):**
- What should be above the fold on an author website? Your name, genre, and featured or latest book, plus one clear call to action such as a buy link or newsletter signup.
- How many calls to action should a homepage have? One primary call to action works best. Too many competing buttons dilutes visitor attention and lowers conversion.
- Does my homepage need a newsletter signup? Yes. It is the single highest-value action a visitor can take besides buying a book, since it lets you reach them again later at no cost.
- How many pages should an author website have? At minimum: Home, Books, About, and Contact. Most authors also add a Blog and a newsletter signup page or section.
- Do author websites need a blog? It is not required, but a blog gives search engines fresh content to index and gives readers a reason to return between book releases.

**Dropped from the old pages:** nothing factual. The "Benefits" lists (lower bounce rate, more signups) said what the checklist already implies.

## Merge 2: `what-is-authorloft`
**New SEO title:** What Is AuthorLoft? A Platform Built for Authors (unchanged)
**Excerpt:** AuthorLoft is a website and business platform built for authors. Here is what it does, what you get, and a plan for your first week.

```html
<h2>What is AuthorLoft?</h2>
<p>AuthorLoft is an all-in-one platform where authors build a website, publish their books, sell directly to readers, grow an email list and manage their author business without separate tools, plugins or a developer.</p>
<p>Most authors end up stitching together five or six tools: a website builder, an email service, a payment processor, an analytics tool and a landing page tool. AuthorLoft replaces that stack with one system built around the author workflow.</p>

<h2>What do you get?</h2>
<ul>
<li><strong>An author website:</strong> homepage, book catalog, blog and About page out of the box.</li>
<li><strong>Direct sales:</strong> sell eBooks, print, audio and bundles through Stripe.</li>
<li><strong>Email marketing:</strong> newsletter signup, campaigns and reader magnets.</li>
<li><strong>ARC management:</strong> recruit and manage advance reader copy teams.</li>
<li><strong>Analytics:</strong> see traffic and sales without installing tracking code.</li>
</ul>
<p>Book catalog, ARC management and reader magnets are built in, not added as plugins. Everything is a form field in the dashboard, not a configuration file. The free plan covers the basics, and paid plans add direct sales, custom domains and AI tools.</p>

<h2>How do I set up my site in the first week?</h2>
<p>A set order stops you staring at an empty dashboard. Do these in sequence and the site is ready to share by the end of the week.</p>
<ol>
<li><strong>Day 1:</strong> create your account and choose a color theme that fits your genre.</li>
<li><strong>Day 2:</strong> add your first book with a cover and description, and a buy link or "coming soon" status.</li>
<li><strong>Day 3:</strong> write your About page.</li>
<li><strong>Day 4:</strong> set up your newsletter signup, the single highest-value addition to your site.</li>
<li><strong>Day 5:</strong> review your homepage with the <a href="/guides/author-website-homepage-checklist">homepage checklist</a>.</li>
<li><strong>Day 6:</strong> connect a custom domain, if you are on Standard or Premium.</li>
<li><strong>Day 7:</strong> share the link on social media and in your email signature.</li>
</ol>

<h2>What mistakes should I avoid?</h2>
<ul>
<li>Treating AuthorLoft like a generic website builder and skipping the author-specific features (direct sales, reader magnets, ARC management).</li>
<li>Not connecting Stripe, which means no direct sales at all.</li>
<li>Staying on the Free plan without checking whether Standard or Premium fits your needs now.</li>
<li>Trying to perfect every page before sharing anything. A live site that is good enough beats a perfect unpublished one.</li>
<li>Skipping the newsletter signup, or not testing the site on a phone before sharing it.</li>
</ul>

<h2>What does growth look like?</h2>
<p>A debut author might start on the Free plan with a book catalog and a blog. As the email list grows, they add a custom domain and direct sales on Standard. As the catalog grows, they add AI tools and audio formats on Premium.</p>
```
**FAQs (merged, 5):** keep the three existing ones on `what-is-authorloft` and add:
- How long does it take to set up an AuthorLoft site? Following the day-by-day plan above, you can have a shareable site in a week. *(The old page said "3-5 days" for most users. I dropped that number because I cannot verify it. Restore it if you have the data.)*
- Should I wait to launch until everything is perfect? No. A live site that is good enough beats a perfect site that never launches. You can keep refining after it is public.

## Merge 3: `building-your-first-author-email-list`
**New SEO title:** Building Your First Author Email List (unchanged lead; "Step-by-Step Guide" dropped to fit 47 characters)
**Excerpt:** Start an author email list from zero: the signup form, a reader magnet, a three-email welcome sequence and what to send next.

```html
<h2>Why start an email list as an author?</h2>
<p>An email list is the one audience you own. Social followers can vanish overnight if a platform changes its algorithm or shuts down. With email there is no algorithm between you and your readers, and reaching them costs nothing. Subscribers also respond better on launch day than cold social posts do.</p>

<h2>How do I start an email list from zero?</h2>
<ol>
<li><strong>Add a signup form to your website:</strong> on the homepage, in the footer and after every blog post.</li>
<li><strong>Offer a reader magnet</strong> (see below) so people have a reason to sign up.</li>
<li><strong>Promote the signup</strong> in social bios, your email signature and the back matter of your books.</li>
<li><strong>Send a welcome email right away</strong> that introduces you and sets expectations.</li>
<li><strong>Email regularly, even without a launch.</strong> A monthly update keeps you top of mind.</li>
</ol>
<p>Do not wait for a book launch to start collecting emails, and do not go silent for months and then email only to sell.</p>

<h2>What is a reader magnet?</h2>
<p>A reader magnet is a free short story, prequel or bonus content that you give readers in exchange for their email address. It grows your list without requiring a sale. Not every visitor is ready to buy on a first visit, and a magnet turns an anonymous visitor into a subscriber you can reach again at no ad cost.</p>
<p>It is free, so there is no checkout and no Stripe setup. Readers get your writing before spending money, which builds trust before the first sale. Subscribers who join through a magnet are good buyers for your next release.</p>
<p><strong>What works:</strong> a prequel novella suits fiction. A quick-start checklist or bonus chapter suits nonfiction. The best magnets give a real taste of your writing style, not just a teaser.</p>
<p><strong>To set one up:</strong> choose the content, upload the file (AuthorLoft lets you give away a book or file free in exchange for an email), feature it on your homepage, blog and social bio, and let the reader get access instantly after signing up.</p>
<p><strong>Mistakes:</strong> giving away content unrelated to your books, which attracts the wrong audience; asking for more than an email address; hiding the magnet; and never following up after the reader claims it.</p>

<h2>What should a welcome email sequence say?</h2>
<p>A welcome sequence is a short series of automated emails a new subscriber gets after signing up. New subscribers are at their most engaged right after signing up, so a good sequence builds a relationship before you ask for a sale. Three emails works for most authors:</p>
<ol>
<li><strong>Email 1, immediately:</strong> deliver the reader magnet, thank them and introduce yourself in a few sentences.</li>
<li><strong>Email 2, 2-3 days later:</strong> a short personal note about why you write and what your books are about.</li>
<li><strong>Email 3, 5-7 days later:</strong> point them to your book catalog and tell them what your regular newsletter will be like.</li>
</ol>
<p>The best sequences read like a conversation, not a pitch. Keep it short, or it feels like spam, and do not ask for a sale in the first email. Set it up once and it runs for every new subscriber.</p>

<h2>What should my first newsletter say?</h2>
<p>A first newsletter does not need to be polished. A short note about your writing progress, a favorite book you are reading or a behind-the-scenes update builds more connection than a sales pitch. After that, aim for at least one email a month. More frequent emails around a launch are normal. For ideas, see <a href="/guides/newsletter-ideas-for-authors">newsletter ideas for authors</a>.</p>
```
**FAQs (merged, 5):** keep the three existing ones on this page and add:
- Do I need Stripe to offer a reader magnet? No. Reader magnets are free, so no payment processing is required, only an email capture form.
- What is a good reader magnet for a first book? A prequel short story or bonus chapter related to your first book works well. It gives readers a taste of your writing and leads into the full book.
- Can welcome emails be automated? Yes. AuthorLoft's welcome email editor sends automatically to every new subscriber, so the sequence runs without manual work after you set it up once.

## Notes
- Merged pages will be around 700-850 words, close to but possibly below the audit's 800-word rule of thumb for the first merge. A longer page is not a goal in itself; the old pages repeated each other.
- Section headings are mostly questions, which also helps the `c_question_headings` finding.
- I did not use the old fixed template (Summary / Why it matters / Benefits / FAQ / How AuthorLoft Helps). The "How AuthorLoft Helps" blocks were not shown in the database text I read, so they may sit in the page template; I would check that on staging before applying.
- The `/guides/author-voice-finding-and-keeping-it` and `/guides/newsletter-ideas-for-authors` links point to guides that exist and are published.
