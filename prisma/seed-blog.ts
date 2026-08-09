import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POSTS = [
  {
    title:           "How to Sell Books Directly to Readers (Without Amazon)",
    slug:            "how-to-sell-books-directly-to-readers",
    excerpt:         "Selling direct gives you higher royalties, reader data, and a relationship Amazon can never give you. Here's how to get started.",
    category:        "Direct Sales",
    readTimeMinutes: 8,
    displayOrder:    0,
  },
  {
    title:           "Best Author Website Builders in 2026 (Compared)",
    slug:            "best-author-website-builders-2026",
    excerpt:         "We compared Squarespace, Wix, WordPress, and AuthorLoft so you don't have to. Here's what actually matters for authors.",
    category:        "Author Tools",
    readTimeMinutes: 7,
    displayOrder:    1,
  },
  {
    title:           "How to Build an Email List as an Author",
    slug:            "how-to-build-email-list-as-author",
    excerpt:         "Your email list is the one asset you own completely. Here's a practical guide to growing it from zero.",
    category:        "Marketing",
    readTimeMinutes: 6,
    displayOrder:    2,
  },
  {
    title:           "Self-Publishing vs Amazon KDP: What Authors Need to Know",
    slug:            "self-publishing-vs-amazon-kdp",
    excerpt:         "KDP made self-publishing mainstream — but it comes with trade-offs most authors don't discover until it's too late.",
    category:        "Publishing",
    readTimeMinutes: 9,
    displayOrder:    3,
  },
  {
    title:           "How to Set Up Direct Sales for Your eBook",
    slug:            "how-to-set-up-direct-ebook-sales",
    excerpt:         "A step-by-step guide to setting up a Stripe-powered checkout for your eBooks so readers can buy directly from you.",
    category:        "Direct Sales",
    readTimeMinutes: 6,
    displayOrder:    4,
  },
  {
    title:           "7 Things Every Author Website Needs",
    slug:            "7-things-every-author-website-needs",
    excerpt:         "Most author websites are missing the basics. Here are the seven elements that turn visitors into subscribers and buyers.",
    category:        "Author Tips",
    readTimeMinutes: 5,
    displayOrder:    5,
  },
  {
    title:           "How AuthorLoft Compares to Payhip and Gumroad",
    slug:            "authorloft-vs-payhip-vs-gumroad",
    excerpt:         "Payhip and Gumroad are popular for digital products — but they weren't built for authors. Here's how AuthorLoft stacks up.",
    category:        "Comparisons",
    readTimeMinutes: 7,
    displayOrder:    6,
  },
  {
    title:           "The Author's Guide to GDPR and Reader Data",
    slug:            "authors-guide-to-gdpr-reader-data",
    excerpt:         "If you're collecting emails or selling to EU readers, GDPR applies to you. Here's what you actually need to do.",
    category:        "Compliance",
    readTimeMinutes: 8,
    displayOrder:    7,
  },
  {
    title:           "How to Price Your eBook for Direct Sales",
    slug:            "how-to-price-your-ebook-direct-sales",
    excerpt:         "Pricing your eBook for a platform like Amazon is very different from pricing for direct sales. Here's how to think about it.",
    category:        "Direct Sales",
    readTimeMinutes: 6,
    displayOrder:    8,
  },
  {
    title:           "Why Authors Are Leaving Amazon KDP for Direct Sales",
    slug:            "why-authors-leaving-amazon-kdp-direct-sales",
    excerpt:         "A growing number of indie authors are reducing their Amazon dependency. We spoke to authors who made the switch — here's what they said.",
    category:        "Publishing",
    readTimeMinutes: 7,
    displayOrder:    9,
  },
];

async function main() {
  console.log("Seeding platform blog posts…\n");

  for (const post of POSTS) {
    const existing = await prisma.platformPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      console.log(`  → Skipping (exists): ${post.title}`);
      continue;
    }
    await prisma.platformPost.create({
      data: {
        ...post,
        content:     "",
        authorName:  "AuthorLoft Team",
        isPublished: false,
        publishedAt: null,
      },
    });
    console.log(`  ✓ Created: ${post.title}`);
  }

  console.log("\nDone. All 10 posts created as drafts. Edit and publish each one when ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
