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
      name: "Free", tier: "FREE", maxBooks: 5, maxStorageMb: 100,
      customDomain: false, salesEnabled: false, flipBooksEnabled: false, monthlyPriceCents: 0,
    },
  });

  const standardPlan = await prisma.plan.upsert({
    where: { tier: "STANDARD" },
    update: {},
    create: {
      name: "Standard", tier: "STANDARD", maxBooks: -1, maxStorageMb: 2000,
      customDomain: true, salesEnabled: true, flipBooksEnabled: true, monthlyPriceCents: 1200,
    },
  });

  await prisma.plan.upsert({
    where: { tier: "PREMIUM" },
    update: {},
    create: {
      name: "Premium", tier: "PREMIUM", maxBooks: -1, maxStorageMb: 10000,
      customDomain: true, salesEnabled: true, flipBooksEnabled: true,
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
      create: { authorId: author.id, isPublished: true, format: "EBOOK", externalBuyUrl: "#", ...data },
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
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Login credentials:");
  console.log("   Email:    andybedford62@gmail.com");
  console.log("   Password: AuthorLoft2026!");
  console.log("\n⚠️  Change your password after first login!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
