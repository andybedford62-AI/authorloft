// AuthorLoft — Placeholder data seeded with A.P. Bedford's catalog
// Replace this via the Admin panel once the app is live.

export const PLACEHOLDER_AUTHOR = {
  id: "author_apbedford",
  slug: "apbedford",
  name: "Anthony (A.P.) Bedford",
  displayName: "A.P. Bedford",
  tagline: "Author | Scuba Instructor | Analytical Explorer",
  shortBio:
    "Anthony is an author, software business analyst, and veteran scuba diving instructor. This unique blend of technical precision and underwater expertise fuels his writing, ranging from the magical adventures of writing children's books to high-stakes underwater scuba thrillers.",
  bio: `Anthony is an author, software business analyst, and veteran scuba diving instructor. This unique blend of technical precision and underwater expertise fuels his writing, ranging from the magical adventures of writing children's books to high-stakes underwater scuba thrillers.

With more than forty years of diving experience, more than four thousand logged dives, and more than five hundred fifty certified students, Bedford brings rare authenticity to stories set in underwater environments.

When he's not writing or diving, Anthony works as a software business analyst, bringing the same analytical rigor to his storytelling that he applies to complex technical problems. This combination of creative imagination and systematic thinking gives his books a distinctive voice that resonates with readers of all ages.`,
  profileImageUrl: "/images/placeholder-author.jpg",
  heroImageUrl: null,
  heroTitle: "The Surge Below: A Psychological Survival Thriller",
  heroSubtitle: "Is now available for purchase.",
  accentColor: "#7B2D2D",
  linkedinUrl: "#",
  youtubeUrl: "#",
  facebookUrl: "#",
  contactEmail: "andybedford62@gmail.com",
};

export const PLACEHOLDER_GENRES = [
  {
    id: "genre_adult_fiction",
    name: "Adult Fiction",
    slug: "adult-fiction",
    parentId: null,
    children: [
      { id: "genre_thriller", name: "Thriller", slug: "thriller", parentId: "genre_adult_fiction" },
      { id: "genre_psychological", name: "Psychological Thriller", slug: "psychological-thriller", parentId: "genre_adult_fiction" },
    ],
  },
  {
    id: "genre_childrens",
    name: "Children's Books",
    slug: "childrens-books",
    parentId: null,
    children: [
      { id: "genre_childrens_reading", name: "Reading Books", slug: "reading-books", parentId: "genre_childrens" },
      { id: "genre_childrens_coloring", name: "Coloring Books", slug: "coloring-books", parentId: "genre_childrens" },
    ],
  },
];

export const PLACEHOLDER_SERIES = [
  {
    id: "series_surge",
    name: "Adult Fiction",
    slug: "adult-fiction",
    description: "High-stakes underwater thrillers for adult readers, drawing on decades of real-world diving expertise.",
    coverUrl: null,
    books: ["book_surge_below", "book_into_deep"],
  },
  {
    id: "series_crabbys",
    name: "Children's Reading Books",
    slug: "childrens-reading-books",
    description: "Heartwarming underwater adventure stories for young readers, featuring colorful ocean characters.",
    coverUrl: null,
    books: ["book_crabbys_ocean", "book_bennys_bubbling"],
  },
  {
    id: "series_coloring",
    name: "Children's Coloring Books",
    slug: "childrens-coloring-books",
    description: "Creative companion coloring books featuring the beloved characters from the reading series.",
    coverUrl: null,
    books: ["book_crabby_color"],
  },
];

export const PLACEHOLDER_BOOKS = [
  {
    id: "book_surge_below",
    seriesId: "series_surge",
    title: "The Surge Below",
    slug: "the-surge-below",
    subtitle: "A Psychological Survival Thriller",
    shortDescription:
      "A gripping psychological survival thriller set beneath the waves, where one diver's worst nightmare becomes a fight for survival.",
    description: `When veteran diver Marcus Cole descends into the blue waters off the Florida Keys, he expects a routine dive. What he finds instead is a labyrinth of terror — a decompression emergency, a missing dive partner, and something ancient stirring in the deep.

Drawing on the author's forty years of real-world diving experience, The Surge Below delivers pulse-pounding authenticity that no other thriller can match. Every breath, every depth gauge, every safety stop is rendered with the precision of a master diver and the suspense of a seasoned storyteller.`,
    coverImageUrl: "/images/books/surge-below.jpg",
    priceCents: 999,
    isFeatured: true,
    isPublished: true,
    genres: ["genre_thriller", "genre_psychological"],
    externalBuyUrl: "#",
  },
  {
    id: "book_into_deep",
    seriesId: "series_surge",
    title: "Into the Deep",
    slug: "into-the-deep",
    subtitle: "A Freediver Thriller",
    shortDescription:
      "A freediver pushes beyond safe limits and discovers that the ocean keeps its own secrets — and its own justice.",
    description: `A companion thriller to The Surge Below. Into the Deep follows elite freediver Elena Vargas as she investigates a series of mysterious disappearances in the cenotes of the Yucatan Peninsula.

With no tanks, no safety net, and a single breath between her and the truth, Elena must confront not only the danger below — but the conspiracy reaching up from the deep into the halls of power above.`,
    coverImageUrl: "/images/books/into-the-deep.jpg",
    priceCents: 999,
    isFeatured: true,
    isPublished: true,
    genres: ["genre_thriller"],
    externalBuyUrl: "#",
  },
  {
    id: "book_crabbys_ocean",
    seriesId: "series_crabbys",
    title: "Crabby's Ocean Friends",
    slug: "crabbys-ocean-friends",
    subtitle: "A Grumpy Crab Learns the Magic of Kindness",
    shortDescription:
      "Welcome to the underwater world of Crabby the Baby Crab! A heartwarming tale set in the ocean.",
    description: `Welcome to the underwater world of Crabby the Baby Crab! "Crabby the Baby Crab" is a heartwarming tale set in the ocean. Crabby wakes up feeling grumpy, but his friends Bubbles, Shelly, Finny, Starry, and Jelly help him discover the joy of friendship, sharing, playing, and helping each other.

Perfect for children ages 3–7, this beautifully illustrated story teaches emotional intelligence, friendship, and the power of a positive attitude — all set in the magical world beneath the waves.`,
    coverImageUrl: "/images/books/crabbys-ocean-friends.jpg",
    priceCents: 599,
    isFeatured: false,
    isPublished: true,
    genres: ["genre_childrens_reading"],
    externalBuyUrl: "#",
  },
  {
    id: "book_bennys_bubbling",
    seriesId: "series_crabbys",
    title: "Benny's Big Bubbling Day",
    slug: "bennys-big-bubbling-day",
    subtitle: "Benny the Blowfish",
    shortDescription:
      "Dive into the Great Blue Reef for an unforgettable underwater adventure! Join Benny the Blowfish on a journey filled with friendship, mystery, and courage.",
    description: `Dive into the Great Blue Reef for an Unforgettable Underwater Adventure! Join Benny the Blowfish on a journey filled with friendship, mystery, and courage in Benny's Big Bubbling Day.

Benny discovers his superpower at the worst possible moment — and learns that being different is what makes you extraordinary. A perfect read-aloud for ocean-loving families.`,
    coverImageUrl: "/images/books/bennys-bubbling-day.jpg",
    priceCents: 599,
    isFeatured: false,
    isPublished: true,
    genres: ["genre_childrens_reading"],
    externalBuyUrl: "#",
  },
  {
    id: "book_crabby_color",
    seriesId: "series_coloring",
    title: "Crabby & Friends Coloring Book",
    slug: "crabby-friends-coloring-book",
    subtitle: "An Ocean Adventure Coloring Book",
    shortDescription:
      "Bring Crabby, Benny, and all their ocean friends to life with your own colors in this companion coloring book.",
    description: `Color your way through the Great Blue Reef! This companion coloring book features all the beloved characters from the Children's Reading Books series — Crabby, Benny, Bubbles, Shelly, and more.

Over 20 detailed ocean scenes, from coral reefs to sunken ships, provide hours of creative fun for young artists ages 3 and up. Makes a perfect gift paired with the reading books.`,
    coverImageUrl: "/images/books/crabby-coloring.jpg",
    priceCents: 399,
    isFeatured: false,
    isPublished: true,
    genres: ["genre_childrens_coloring"],
    externalBuyUrl: "#",
  },
];
