import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper: find or create a genre (handles null parentId safely)
async function findOrCreateGenre(data: {
  authorId: string;
  name: string;
  slug: string;
  parentId?: string;
  sortOrder: number;
}) {
  const existing = await prisma.genre.findFirst({
    where: {
      authorId: data.authorId,
      slug: data.slug,
      parentId: data.parentId ?? null,
    },
  });
  if (existing) return existing;
  return prisma.genre.create({ data });
}

async function main() {
  console.log("🌱 Seeding AuthorLoft database...");

  // ── Plans ──────────────────────────────────────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { tier: "FREE" },
    update: {},
    create: {
      name: "Free", slug: "free", tier: "FREE", maxBooks: 5, maxStorageMb: 100,
      customDomain: false, salesEnabled: false, flipBooksLimit: 0, monthlyPriceCents: 0,
    },
  });

  const standardPlan = await prisma.plan.upsert({
    where: { tier: "STANDARD" },
    update: {},
    create: {
      name: "Standard", slug: "standard", tier: "STANDARD", maxBooks: -1, maxStorageMb: 2000,
      customDomain: true, salesEnabled: true, flipBooksLimit: -1, monthlyPriceCents: 1200,
    },
  });

  await prisma.plan.upsert({
    where: { tier: "PREMIUM" },
    update: {},
    create: {
      name: "Premium", slug: "premium", tier: "PREMIUM", maxBooks: -1, maxStorageMb: 10000,
      customDomain: true, salesEnabled: true, flipBooksLimit: -1,
      analyticsEnabled: true, monthlyPriceCents: 2900,
    },
  });

  console.log("✓ Plans created");

  // ── Author ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("AuthorLoft2026!", 12);

  const author = await prisma.author.upsert({
    where: { email: "andybedford62@gmail.com" },
    update: {},
    create: {
      email: "andybedford62@gmail.com",
      passwordHash,
      name: "Anthony (A.P.) Bedford",
      displayName: "A.P. Bedford",
      slug: "apbedford",
      tagline: "Author | Scuba Instructor | Analytical Explorer",
      shortBio: "Anthony is an author, software business analyst, and veteran scuba diving instructor. This unique blend of technical precision and underwater expertise fuels his writing, ranging from the magical adventures of writing children's books to high-stakes underwater scuba thrillers.",
      bio: "Anthony is an author, software business analyst, and veteran scuba diving instructor. This unique blend of technical precision and underwater expertise fuels his writing, ranging from the magical adventures of writing children's books to high-stakes underwater scuba thrillers.\n\nWith more than forty years of diving experience, more than four thousand logged dives, and more than five hundred fifty certified students, Bedford brings rare authenticity to stories set in underwater environments.",
      heroTitle: "The Surge Below: A Psychological Survival Thriller",
      heroSubtitle: "Is now available for purchase.",
      accentColor: "#7B2D2D",
      contactEmail: "andybedford62@gmail.com",
      isSuperAdmin: true,
      isActive: true,
      planId: standardPlan.id,
    },
  });

  console.log("✓ Author created:", author.email);

  // ── Genres ────────────────────────────────────────────────────────────────
  const adultFiction    = await findOrCreateGenre({ authorId: author.id, name: "Adult Fiction",            slug: "adult-fiction",            sortOrder: 1 });
  const thriller        = await findOrCreateGenre({ authorId: author.id, name: "Thriller",                 slug: "thriller",                 parentId: adultFiction.id, sortOrder: 1 });
  const psychThrill     = await findOrCreateGenre({ authorId: author.id, name: "Psychological Thriller",   slug: "psychological-thriller",   parentId: adultFiction.id, sortOrder: 2 });
  const childrens       = await findOrCreateGenre({ authorId: author.id, name: "Children's Books",         slug: "childrens-books",          sortOrder: 2 });
  const childrensRead   = await findOrCreateGenre({ authorId: author.id, name: "Reading Books",            slug: "reading-books",            parentId: childrens.id, sortOrder: 1 });
  const childrensColor  = await findOrCreateGenre({ authorId: author.id, name: "Coloring Books",           slug: "coloring-books",           parentId: childrens.id, sortOrder: 2 });

  console.log("✓ Genres created");

  // ── Series ────────────────────────────────────────────────────────────────
  const adultSeries = await prisma.series.upsert({
    where: { authorId_slug: { authorId: author.id, slug: "adult-fiction" } },
    update: {},
    create: { authorId: author.id, name: "Adult Fiction", slug: "adult-fiction", description: "High-stakes underwater thrillers for adult readers.", sortOrder: 1 },
  });

  const childrensSeries = await prisma.series.upsert({
    where: { authorId_slug: { authorId: author.id, slug: "childrens-reading-books" } },
    update: {},
    create: { authorId: author.id, name: "Children's Reading Books", slug: "childrens-reading-books", description: "Heartwarming underwater adventure stories for young readers.", sortOrder: 2 },
  });

  const coloringSeries = await prisma.series.upsert({
    where: { authorId_slug: { authorId: author.id, slug: "childrens-coloring-books" } },
    update: {},
    create: { authorId: author.id, name: "Children's Coloring Books", slug: "childrens-coloring-books", description: "Creative companion coloring books featuring beloved characters.", sortOrder: 3 },
  });

  console.log("✓ Series created");

  // ── Books ─────────────────────────────────────────────────────────────────
  const books = [
    {
      slug: "the-surge-below", seriesId: adultSeries.id, title: "The Surge Below",
      subtitle: "A Psychological Survival Thriller", priceCents: 999, isFeatured: true, sortOrder: 1,
      shortDescription: "A gripping psychological survival thriller set beneath the waves.",
      description: "When veteran diver Marcus Cole descends into the blue waters off the Florida Keys, he expects a routine dive. What he finds instead is a labyrinth of terror.",
      genres: [thriller.id, psychThrill.id],
    },
    {
      slug: "into-the-deep", seriesId: adultSeries.id, title: "Into the Deep",
      subtitle: "A Freediver Thriller", priceCents: 999, isFeatured: true, sortOrder: 2,
      shortDescription: "A freediver pushes beyond safe limits and discovers that the ocean keeps its own secrets.",
      description: "A companion thriller to The Surge Below. Into the Deep follows elite freediver Elena Vargas as she investigates mysterious disappearances in the cenotes of the Yucatan Peninsula.",
      genres: [thriller.id],
    },
    {
      slug: "crabbys-ocean-friends", seriesId: childrensSeries.id, title: "Crabby's Ocean Friends",
      subtitle: "A Grumpy Crab Learns the Magic of Kindness", priceCents: 599, isFeatured: false, sortOrder: 1,
      shortDescription: "Welcome to the underwater world of Crabby the Baby Crab! A heartwarming tale set in the ocean.",
      description: "Crabby wakes up feeling grumpy, but his friends Bubbles, Shelly, Finny, Starry, and Jelly help him discover the joy of friendship, sharing, and helping each other.",
      genres: [childrensRead.id],
    },
    {
      slug: "bennys-big-bubbling-day", seriesId: childrensSeries.id, title: "Benny's Big Bubbling Day",
      subtitle: "Benny the Blowfish", priceCents: 599, isFeatured: false, sortOrder: 2,
      shortDescription: "Dive into the Great Blue Reef for an unforgettable underwater adventure with Benny the Blowfish.",
      description: "Join Benny the Blowfish on a journey filled with friendship, mystery, and courage in Benny's Big Bubbling Day.",
      genres: [childrensRead.id],
    },
    {
      slug: "crabby-friends-coloring-book", seriesId: coloringSeries.id, title: "Crabby & Friends Coloring Book",
      subtitle: "An Ocean Adventure Coloring Book", priceCents: 399, isFeatured: false, sortOrder: 1,
      shortDescription: "Bring Crabby, Benny, and all their ocean friends to life with your own colors.",
      description: "Over 20 detailed ocean scenes provide hours of creative fun for young artists ages 3 and up.",
      genres: [childrensColor.id],
    },
  ];

  for (const bookData of books) {
    const { genres, ...data } = bookData;
    const book = await prisma.book.upsert({
      where: { authorId_slug: { authorId: author.id, slug: data.slug } },
      update: {},
      create: { authorId: author.id, isPublished: true, availableFormats: ["EBOOK"], externalBuyUrl: "#", ...data },
    });
    for (const genreId of genres) {
      await prisma.bookGenre.upsert({
        where: { bookId_genreId: { bookId: book.id, genreId } },
        update: {},
        create: { bookId: book.id, genreId },
      });
    }
  }

  console.log("✓ Books created");

  // ── Help Center ────────────────────────────────────────────────────────────
  const seoTopic = await prisma.helpTopic.upsert({
    where: { slug: "seo-discoverability" },
    update: {},
    create: {
      title: "SEO & Discoverability",
      slug: "seo-discoverability",
      description: "Optimize your author site for search engines and readers",
      icon: "Search",
      sortOrder: 5,
      isPublished: true,
    },
  });

  await prisma.helpArticle.upsert({
    where: { id: "sitemap-help-article" },
    update: {},
    create: {
      id: "sitemap-help-article",
      topicId: seoTopic.id,
      question: "What is a sitemap and where do readers find mine?",
      answer: `<h3>Your Author Sitemap</h3>
<p>Every author site automatically includes a <strong>sitemap.xml</strong> file that helps search engines discover and index all your content.</p>

<h3>Where to Find It</h3>
<p>Your sitemap is available at:</p>
<ul>
  <li><strong>Using your slug:</strong> <code>https://yourauthor.authorloft.com/sitemap.xml</code></li>
  <li><strong>Using custom domain:</strong> <code>https://yourdomain.com/sitemap.xml</code></li>
</ul>

<h3>What's Included</h3>
<p>Your sitemap automatically includes:</p>
<ul>
  <li><strong>Home page</strong> – your author profile</li>
  <li><strong>About page</strong> – if enabled in your site navigation</li>
  <li><strong>Books & book pages</strong> – all published books (if books section is enabled)</li>
  <li><strong>Blog posts</strong> – all published blog posts (if blog is enabled)</li>
  <li><strong>Contact page</strong> – if enabled in navigation</li>
  <li><strong>Flip books</strong> – any flip book pages (if enabled)</li>
  <li><strong>Custom pages</strong> – any custom pages you've created</li>
</ul>

<h3>Why This Matters</h3>
<p>Your sitemap helps search engines like Google understand the structure of your site and index your content faster. This improves your SEO and helps readers discover your books and writing.</p>

<p><strong>The good news:</strong> This is completely automatic! Your sitemap updates whenever you publish new content, change page settings, or update your site.</p>`,
      sortOrder: 1,
      isPublished: true,
    },
  });

  console.log("✓ Help articles created");

  // ── Social Promote ─────────────────────────────────────────────────────────
  await prisma.socialPromoteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  const platforms = [
    { id: "plat_facebook",  slug: "facebook",  name: "Facebook",    maxChars: 2000, hashtagStyle: "trailing", isPremiumOnly: false, sortOrder: 1, promptAddendum: "Conversational tone. 1–3 short paragraphs. Hashtags optional and minimal." },
    { id: "plat_instagram", slug: "instagram", name: "Instagram",   maxChars: 2200, hashtagStyle: "trailing", isPremiumOnly: false, sortOrder: 2, promptAddendum: "Visual, evocative tone. Strong opening hook. Use line breaks. 5–10 relevant hashtags at the end." },
    { id: "plat_x",         slug: "x",         name: "X (Twitter)", maxChars: 280,  hashtagStyle: "inline",   isPremiumOnly: false, sortOrder: 3, promptAddendum: "Punchy, single-thought post. Hard 280-char limit including spaces. 1–2 hashtags max." },
    { id: "plat_linkedin",  slug: "linkedin",  name: "LinkedIn",    maxChars: 3000, hashtagStyle: "none",     isPremiumOnly: true,  sortOrder: 4, promptAddendum: "Professional, thoughtful tone. Lead with insight, end with a question or CTA. Hashtags optional and sparse." },
    { id: "plat_tiktok",    slug: "tiktok",    name: "TikTok",      maxChars: 2200, hashtagStyle: "trailing", isPremiumOnly: true,  sortOrder: 5, promptAddendum: "Short, hook-driven caption written as if narrating a vertical video. Trending-aware. 3–5 hashtags." },
  ];
  for (const p of platforms) {
    await prisma.socialPromotePlatform.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  const promoTypes = [
    { id: "promo_new_release",        slug: "new-release",        name: "New Release Announcement",     description: "Announce a newly published book.",                       promptTemplate: 'Write a social post announcing the new release of "{{book.title}}" by {{author.displayName}}. Tease the premise without spoilers and invite readers to grab a copy.', applicableContexts: ["book"], sortOrder: 1 },
    { id: "promo_pre_order",          slug: "pre-order",          name: "Pre-Order Open",               description: "Drive pre-orders before launch day.",                    promptTemplate: 'Write a social post announcing that pre-orders are open for "{{book.title}}". Build anticipation, highlight what makes it worth waiting for, and link to the pre-order page.', applicableContexts: ["book"], sortOrder: 2 },
    { id: "promo_cover_reveal",       slug: "cover-reveal",       name: "Cover Reveal",                 description: "Reveal a new book cover.",                               promptTemplate: 'Write a social post unveiling the new cover for "{{book.title}}". Build excitement around the visual, hint at the story tone, and invite reactions.', applicableContexts: ["book"], sortOrder: 3 },
    { id: "promo_sale",               slug: "sale",               name: "Sale / Discount",              description: "Promote a limited-time price drop.",                     promptTemplate: 'Write a social post announcing a limited-time sale on "{{book.title}}". Create urgency without being pushy and make the value clear.', applicableContexts: ["book"], sortOrder: 4 },
    { id: "promo_free_magnet",        slug: "free-magnet",        name: "Free / Reader Magnet",         description: "Promote a free download or reader magnet.",              promptTemplate: 'Write a social post offering a free download tied to "{{book.title}}". Frame it as a low-friction way for new readers to try the work.', applicableContexts: ["book"], sortOrder: 5 },
    { id: "promo_review_quote",       slug: "review-quote",       name: "Reader Review Quote",          description: "Share a glowing reader review.",                         promptTemplate: 'Write a social post featuring a reader review of "{{book.title}}". Lead with the most compelling line and add a brief note inviting new readers in.', applicableContexts: ["book"], sortOrder: 6 },
    { id: "promo_behind_scenes",      slug: "behind-the-scenes",  name: "Behind-the-Scenes",            description: "Share a writing-life or production moment.",             promptTemplate: 'Write a social post sharing a behind-the-scenes glimpse of {{author.displayName}}\'s work on "{{book.title}}". Make it feel personal and human.', applicableContexts: ["book","topic"], sortOrder: 7 },
    { id: "promo_character_spotlight",slug: "character-spotlight",name: "Character Spotlight",          description: "Spotlight a character from the book.",                   promptTemplate: 'Write a social post spotlighting a memorable character from "{{book.title}}". Tease who they are and what makes them compelling without spoilers.', applicableContexts: ["book"], sortOrder: 8 },
    { id: "promo_setting_spotlight",  slug: "setting-spotlight",  name: "Setting / World Spotlight",    description: "Spotlight the world or setting.",                        promptTemplate: 'Write a social post about the world or setting of "{{book.title}}". Make readers want to step inside it.', applicableContexts: ["book"], sortOrder: 9 },
    { id: "promo_book_quote",         slug: "book-quote",         name: "Quote from the Book",          description: "Share a memorable line from the book.",                  promptTemplate: 'Write a social post built around a short, evocative quote from "{{book.title}}". Let the quote do the heavy lifting and add only minimal framing.', applicableContexts: ["book"], sortOrder: 10 },
    { id: "promo_milestone",          slug: "milestone",          name: "Milestone Celebration",        description: "Celebrate a sales, review, or anniversary milestone.",   promptTemplate: 'Write a social post celebrating a milestone for "{{book.title}}" (e.g. sales, reviews, anniversary). Thank readers and invite new ones to join in.', applicableContexts: ["book","news"], sortOrder: 11 },
    { id: "promo_writing_tip",        slug: "writing-tip",        name: "Writing Process / Tip",        description: "Share a craft insight or process note.",                 promptTemplate: 'Write a social post from {{author.displayName}} sharing a short writing process insight or craft tip. Stay practical and concise.', applicableContexts: ["topic"], sortOrder: 12 },
    { id: "promo_qa_prompt",          slug: "qa-prompt",          name: "Q&A / Ask Me Anything",        description: "Invite readers to ask questions.",                       promptTemplate: 'Write a social post from {{author.displayName}} inviting readers to ask a question — about the writing, the books, or the world.', applicableContexts: ["topic"], sortOrder: 13 },
    { id: "promo_event",              slug: "event",              name: "Event / Signing / Appearance", description: "Promote an upcoming event or appearance.",               promptTemplate: 'Write a social post promoting an upcoming event or appearance by {{author.displayName}}. Make the date, place, and what readers can expect crystal clear.', applicableContexts: ["news","topic"], sortOrder: 14 },
  ];
  for (const t of promoTypes) {
    await prisma.socialPromoType.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }

  console.log("✓ Social Promote seeded (5 platforms, 14 promo types, settings)");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Login credentials:");
  console.log("   Email:    andybedford62@gmail.com");
  console.log("   Password: AuthorLoft2026!");
  console.log("\n⚠️  Change your password after first login!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
