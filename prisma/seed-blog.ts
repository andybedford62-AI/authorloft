/**
 * Seed script — placeholder Blog/News posts for testing.
 * Run with:  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-blog.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTHOR_EMAIL = "andybedford62@gmail.com";

const posts = [
  {
    title: "Introducing AuthorLoft — A New Home for Authors",
    slug: "introducing-authorloft",
    excerpt:
      "AuthorLoft is here — a beautiful, purpose-built platform that gives authors everything they need to showcase their work, connect with readers, and sell books directly.",
    content: `AuthorLoft was built with one idea in mind: authors deserve a better online presence.

Most author websites are either generic templates that look like everyone else's, or expensive custom builds that require a developer to change a single sentence. Neither option feels right.

AuthorLoft changes that. It's a multi-tenant platform purpose-built for authors — meaning every author gets their own fully branded website at their own address, with their own books, series, blog, and newsletter signup. No coding required. No one-size-fits-all templates.

**What makes AuthorLoft different?**

From the very first page, your site looks and feels like *you*. Pick your accent color, upload your photo, write your bio, and your books are front and center. Readers arrive on a page that says "this is a real author with a real story to tell" — not a placeholder.

**Built for the way authors actually work**

AuthorLoft is designed around the rhythms of writing and publishing. Add a new book with an ISBN lookup that pulls in your cover, description, and metadata automatically. Flag a book as "New Release!" and it shows up that way on your homepage. Set a release date and readers see it front and center on the book detail page.

Series, genres, format badges (eBook, Paperback, Hardback, Audiobook) — all there. Retailer links to Amazon, Barnes & Noble, Kobo, Apple Books — all configurable. Even a built-in direct sales checkout if you want to sell straight from your own site.

**A blog that's actually part of your brand**

This is one of those posts. The Blog & News section lets you keep readers in the loop — new releases, behind-the-scenes updates, event announcements, whatever you want to share. Each post lives on your site, drives traffic back to you, and gives your newsletter something to link to.

**Coming soon**

AuthorLoft is growing. Flip books, analytics, custom domains, and more are on the roadmap. If you're an author looking for a smarter way to manage your online presence, AuthorLoft is the place to be.

Welcome aboard.`,
    coverImageUrl: null,
    isPublished: true,
  },
  {
    title: "5 Things Every Author Website Needs in 2026",
    slug: "5-things-every-author-website-needs",
    excerpt:
      "Your author website is your home base on the internet. Here are five things it absolutely must have to turn visitors into readers — and readers into fans.",
    content: `Whether you're a debut novelist or a seasoned multi-series author, your website is working for you 24 hours a day. Here's what it needs to do the job well.

**1. A clear, compelling bio**

Readers want to know who wrote the book they just finished — or who they're about to trust with their next few hours. Your bio doesn't have to be your entire life story. A few sharp sentences about who you are, what you write, and why you write it goes a long way. Think of it as the back flap of your book, but for you.

**2. Every book, beautifully presented**

Cover image, title, tagline, a short description, and somewhere to buy it. That's the minimum. Bonus points for series information, available formats, and a release date if you're building anticipation for something new. Readers browse. Make it easy.

**3. A way to stay in touch**

Email is still the most reliable way to reach readers directly. Social media algorithms change. Newsletters don't. An email signup form — ideally with a small incentive like a free chapter or exclusive content — lets you build an audience you actually own.

**4. A blog or news section**

Fresh content signals to both readers and search engines that your site is alive. It doesn't have to be a daily commitment. One post a month about a new release, a writing update, or something that inspired a story is enough to keep readers coming back.

**5. Fast, mobile-friendly design**

More than half of all web traffic is on a phone. If your site is slow to load or hard to read on a small screen, you're losing readers before they even see your books. AuthorLoft handles this automatically — every author site is fully responsive and optimized out of the box.

Your website doesn't have to be complicated. It just has to be *you*.`,
    coverImageUrl: null,
    isPublished: true,
  },
  {
    title: "Coming Soon: Direct Sales, Analytics & Custom Domains",
    slug: "coming-soon-features",
    excerpt:
      "A peek at what's on the AuthorLoft roadmap — including direct-to-reader sales, site analytics, and custom domain support for your author brand.",
    content: `AuthorLoft is just getting started. Here's a look at what's coming next for authors on the platform.

**Direct-to-reader sales**

The ability to sell your eBooks, paperbacks, and audiobooks directly from your AuthorLoft site — without going through a third-party retailer — is nearly ready. You keep more of every sale, and readers get a frictionless checkout experience. This will be available on Standard and Premium plans with Stripe integration.

**Site analytics**

Soon you'll be able to see how many people are visiting your site, which books are getting the most attention, where your readers are coming from, and how your newsletter is growing. Real data to help you understand what's working.

**Custom domains**

Your AuthorLoft site already has a clean address at *yourname.authorloft.com*. But if you have your own domain — *yourname.com* — you'll soon be able to point it directly to your AuthorLoft site. One more step toward making your online presence feel completely yours.

**Flip books**

Interactive online versions of your books that readers can browse right in the browser — page by page, with a realistic page-turn effect. Great for previews and promotional excerpts.

We're building AuthorLoft in the open, shaped by real author feedback. If there's a feature you'd love to see, we want to hear about it.

Stay tuned — there's a lot more to come.`,
    coverImageUrl: null,
    isPublished: false, // Draft — saved but not yet published
  },
];

async function main() {
  console.log("🌱 Seeding blog posts...\n");

  const author = await prisma.author.findUnique({
    where: { email: AUTHOR_EMAIL },
    select: { id: true, name: true },
  });

  if (!author) {
    console.error(`❌  Author not found for email: ${AUTHOR_EMAIL}`);
    console.error("   Run the main seed first: npx prisma db seed");
    process.exit(1);
  }

  console.log(`✓  Found author: ${author.name} (${AUTHOR_EMAIL})\n`);

  for (const post of posts) {
    const existing = await prisma.post.findFirst({
      where: { authorId: author.id, slug: post.slug },
    });

    if (existing) {
      console.log(`   → Skipped (already exists): "${post.title}"`);
      continue;
    }

    await prisma.post.create({
      data: {
        authorId: author.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        isPublished: post.isPublished,
        publishedAt: post.isPublished ? new Date() : null,
      },
    });

    const status = post.isPublished ? "✓ Published" : "○ Draft";
    console.log(`   ${status}: "${post.title}"`);
  }

  console.log("\n✅  Blog seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
