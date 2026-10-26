# Rollback data for the 21 Oct 2026 thin-page merges

Old values of the three target `Guide` rows, saved before the merged text was applied. To roll back: set these columns back, set `isPublished = true` on the five merged guides, and delete the five redirects added in commit `5524d321`.

Merged guides unpublished: author-website-mistakes, best-author-website-examples, getting-started-guide, welcome-email-sequence-for-authors, reader-magnets-explained. Their content was not changed, only `isPublished`.

Note: each old page ended with a "How AuthorLoft Helps" paragraph that the approved merged text does not include. Those paragraphs are kept below.

## author-website-homepage-checklist
- seoTitle: `The Author Website Homepage Checklist`
- excerpt: `Your homepage is the most important page on your site. Use this checklist to make sure it does its job — turning visitors into readers and subscribers.`
- metaDescription: `A complete checklist for what your author website homepage needs to convert visitors into readers and subscribers.`
- relatedSlugsJson: `["7-things-every-author-website-needs","why-your-author-website-needs-a-sitemap","author-website-seo-quick-wins"]`
- faqsJson: `[{"answer": "Your name, genre, and featured or latest book, plus one clear call to action such as a buy link or newsletter signup.", "question": "What should be above the fold on an author website?"}, {"answer": "One primary call to action works best. Too many competing buttons dilutes visitor attention and lowers conversion.", "question": "How many calls to action should a homepage have?"}, {"answer": "Yes. It is the single highest-value action a visitor can take besides buying a book, since it lets you reach them again later at no cost.", "question": "Does my homepage need a newsletter signup?"}]`
- content (old): sections "2-Minute Summary", "Why It Matters", "Benefits of a Homepage That Works", "The Checklist" (same ten points as the new page), "Common Mistakes", "Example Homepage Flow", "Frequently Asked Questions", "How AuthorLoft Helps". Old closing paragraph: "Every AuthorLoft homepage ships with this checklist already built in — hero, featured book, newsletter capture, and recent posts — so you can go live without guessing what belongs above the fold."

## building-your-first-author-email-list
- seoTitle: `Building Your First Author Email List: A Step-by-Step Guide`
- excerpt: `An email list is the one audience you fully own. Here's exactly how to start one from zero, even with no existing readers.`
- metaDescription: `How to start an author email list from zero, including reader magnets, welcome emails, and where to place your signup form.`
- relatedSlugsJson: `["3-reader-magnets-that-grow-email-list"]`
- faqsJson: `[{"answer": "Add a signup form to your website, offer a free reader magnet as an incentive, and promote the signup link across your social media bios and book back matter.", "question": "How do I start an email list with zero subscribers?"}, {"answer": "A simple welcome — introduce yourself, thank them for subscribing, and set expectations for what kind of emails they'll receive and how often.", "question": "What should my first email say?"}, {"answer": "At minimum monthly, so subscribers don't forget who you are. More frequent emails around a launch are normal and expected.", "question": "How often should I email my list?"}]`
- content (old): sections "2-Minute Summary", "Why It Matters", "Benefits of Building an Email List", "Step-by-Step: Starting From Zero" (five steps, same as the new page), "Common Mistakes", "Examples", "Frequently Asked Questions", "How AuthorLoft Helps". Old closing paragraph: "AuthorLoft includes newsletter signup forms on every page, a reader magnet feature to incentivize signups, and full newsletter campaign sending — so your list-building and email sending live in one place."

## what-is-authorloft
- seoTitle: `What Is AuthorLoft? A Platform Built for Authors` (unchanged)
- excerpt: `AuthorLoft is a website and business platform built specifically for authors. Here's what it does and how it's different from a general website builder.`
- metaDescription: `AuthorLoft is an all-in-one website, sales, and marketing platform for authors. See what it replaces and what's included.` (unchanged)
- relatedSlugsJson: `["author-needs-a-website-in-2026","authorloft-not-just-an-author-website"]` (unchanged)
- faqsJson: `[{"question":"Is AuthorLoft free to use?","answer":"Yes, AuthorLoft has a free plan that includes a book catalog, blog, about page, and contact form. Paid plans add custom domains, direct sales, and more storage."},{"question":"Do I need coding experience to use AuthorLoft?","answer":"No. AuthorLoft is a no-code platform managed entirely through a visual dashboard."},{"question":"What makes AuthorLoft different from Wix or WordPress?","answer":"AuthorLoft is built specifically for authors, with book catalogs, direct sales, reader magnets, and ARC management included by default instead of requiring plugins or custom development."}]`
- content (old): sections "2-Minute Summary", "Why It Matters", "Benefits", "Step-by-Step: What You Get" (five items, same as the new page), "Common Mistakes" (three bullets), "Examples", "Frequently Asked Questions", "How AuthorLoft Helps". Old closing paragraph: "This entire Learn library is a practical demonstration — every guide links back to the specific AuthorLoft feature that solves the problem it describes."

## Exact old `content` HTML

### author-website-homepage-checklist
```html
<h2>2-Minute Summary</h2>
<p>Your homepage has one job: tell a new visitor who you are, what you write, and what to do next — in under five seconds. This checklist covers every element a strong author homepage needs.</p>

<h2>Why It Matters</h2>
<p>Most traffic to your site — from social media, search, or a reader who heard about you at an event — lands on the homepage first. If it doesn't immediately communicate who you are and what to do next, you lose that visitor before they ever see your books.</p>

<h2>Benefits of a Homepage That Works</h2>
<ul>
  <li>Visitors immediately understand your genre and latest release</li>
  <li>Clear next steps reduce bounce rate</li>
  <li>More newsletter signups from first-time visitors</li>
  <li>Higher click-through to your book catalog</li>
</ul>

<h2>The Checklist</h2>
<ol>
  <li><strong>Your name and genre, above the fold</strong> — no guessing required</li>
  <li><strong>Your latest or featured book</strong> — with a cover image and a buy link</li>
  <li><strong>One primary call to action</strong> — "Get the book" or "Join the list," not five competing buttons</li>
  <li><strong>A newsletter signup form</strong> — visible without scrolling if possible</li>
  <li><strong>A short bio teaser</strong> — a sentence or two with a link to your full About page</li>
  <li><strong>Social proof</strong> — reviews, awards, or press mentions if you have them</li>
  <li><strong>Recent blog posts or news</strong> — shows the site is active</li>
  <li><strong>Mobile-friendly layout</strong> — most visitors will view your site on a phone</li>
  <li><strong>Fast load time</strong> — large uncompressed images slow the page and hurt SEO</li>
  <li><strong>Working navigation</strong> — links to Books, About, and Contact clearly visible</li>
</ol>

<h2>Common Mistakes</h2>
<ul>
  <li>Leading with a long biography instead of your book</li>
  <li>No visible newsletter signup</li>
  <li>Too many calls to action competing for attention</li>
  <li>Slow-loading, uncompressed hero images</li>
</ul>

<h2>Example Homepage Flow</h2>
<p>Hero (name + genre + featured book) → Newsletter signup → Book catalog preview → About teaser → Recent blog posts → Footer with social links. This order moves visitors from a big first impression to a low-commitment action before asking for a purchase.</p>

<h2>Frequently Asked Questions</h2>
<p>See below.</p>

<h2>How AuthorLoft Helps</h2>
<p>Every AuthorLoft homepage ships with this checklist already built in — hero, featured book, newsletter capture, and recent posts — so you can go live without guessing what belongs above the fold.</p>
```

### building-your-first-author-email-list
```html
<h2>2-Minute Summary</h2>
<p>An author email list starts with a single signup form and a reason for someone to join it — usually a reader magnet. From there, consistent, low-pressure emails turn strangers into subscribers and subscribers into buyers.</p>

<h2>Why It Matters</h2>
<p>Social media followers can disappear overnight if a platform changes its algorithm or shuts down. An email list is the one channel you own outright — no algorithm decides who sees your message, and no platform can take it away.</p>

<h2>Benefits of Building an Email List</h2>
<ul>
  <li><strong>Direct access to readers</strong> — no algorithm between you and your audience</li>
  <li><strong>Higher launch-day sales</strong> — subscribers convert far better than cold social posts</li>
  <li><strong>Owned asset</strong> — the list is yours no matter what happens to any social platform</li>
  <li><strong>Free to reach</strong> — no ad spend required to reach subscribers</li>
</ul>

<h2>Step-by-Step: Starting From Zero</h2>
<ol>
  <li><strong>Add a signup form to your author website</strong> — homepage, footer, and after every blog post</li>
  <li><strong>Offer a reader magnet</strong> — a free short story or bonus content gives people a reason to sign up</li>
  <li><strong>Promote the signup everywhere</strong> — social bios, email signature, and the back matter of your books</li>
  <li><strong>Send a welcome email immediately</strong> — introduce yourself and set expectations for what they'll receive</li>
  <li><strong>Email consistently, even without a launch</strong> — a monthly update keeps you top of mind</li>
</ol>

<h2>Common Mistakes</h2>
<ul>
  <li>Waiting until a book launch to start collecting emails</li>
  <li>No reader magnet or incentive to sign up</li>
  <li>Going silent for months, then emailing only to sell</li>
  <li>Making the signup form hard to find on the website</li>
</ul>

<h2>Examples</h2>
<p>A first newsletter doesn't need to be polished — a short note about your writing progress, a favorite book you're reading, or a behind-the-scenes update builds connection more than a sales pitch would.</p>

<h2>Frequently Asked Questions</h2>
<p>See below.</p>

<h2>How AuthorLoft Helps</h2>
<p>AuthorLoft includes newsletter signup forms on every page, a reader magnet feature to incentivize signups, and full newsletter campaign sending — so your list-building and email sending live in one place.</p>
```

### what-is-authorloft
```html
<h2>2-Minute Summary</h2>
<p>AuthorLoft is an all-in-one platform for authors to build a website, publish books, sell directly to readers, grow an email list, and manage their author business — without needing separate tools, plugins, or a developer.</p>

<h2>Why It Matters</h2>
<p>Most authors end up stitching together five or six separate tools: a website builder, an email service, a payment processor, an analytics tool, and a landing page tool. AuthorLoft replaces that stack with one system designed specifically for the author workflow.</p>

<h2>Benefits</h2>
<ul>
  <li><strong>Author-specific, not generic</strong> — book catalog, ARC management, and reader magnets are built in, not bolted on</li>
  <li><strong>One dashboard</strong> — website, sales, email, and analytics in a single place</li>
  <li><strong>No plugins or code required</strong> — everything is a form field, not a configuration file</li>
  <li><strong>Grows with you</strong> — free plan to start, paid plans add direct sales, custom domains, and AI tools</li>
</ul>

<h2>Step-by-Step: What You Get</h2>
<ol>
  <li><strong>An author website</strong> — homepage, book catalog, blog, and about page out of the box</li>
  <li><strong>Direct sales</strong> — sell eBooks, print, audio, and bundles through Stripe</li>
  <li><strong>Email marketing</strong> — newsletter signup, campaigns, and reader magnets</li>
  <li><strong>ARC management</strong> — recruit and manage advance reader copy teams</li>
  <li><strong>Analytics</strong> — see traffic and sales without installing tracking code</li>
</ol>

<h2>Common Mistakes</h2>
<ul>
  <li>Treating AuthorLoft like a generic website builder instead of using its author-specific features (direct sales, reader magnets, ARC management)</li>
  <li>Not connecting Stripe, missing out on direct sales entirely</li>
  <li>Starting on the Free plan and never revisiting whether Standard or Premium fits current needs</li>
</ul>

<h2>Examples</h2>
<p>A debut author might start on the Free plan with a book catalog and blog. As their list grows, they add a custom domain and direct sales on Standard. As their catalog expands, they add AI tools and audio formats on Premium.</p>

<h2>Frequently Asked Questions</h2>
<p>See below.</p>

<h2>How AuthorLoft Helps</h2>
<p>This entire Learn library is a practical demonstration — every guide links back to the specific AuthorLoft feature that solves the problem it describes.</p>
```

## Small edits made at the same time (rollback)
- Guide `build-your-first-website`.relatedSlugsJson: removed "author-website-mistakes" (it was listed alongside "author-website-homepage-checklist").
- Guide `authorloft-vs-bookfunnel`.relatedSlugsJson: "reader-magnets-explained" -> "building-your-first-author-email-list".
- Post `3-reader-magnets-that-grow-email-list`.content: "/guides/reader-magnets-explained" -> "/guides/building-your-first-author-email-list".
