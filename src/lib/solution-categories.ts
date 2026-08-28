export interface SolutionItem {
  slug: string;
  label: string;
  blurb: string;
}

export interface SolutionCategory {
  id: string;
  label: string;
  description: string;
  items: SolutionItem[];
}

/**
 * Single source of truth for how the 12 solution pages group into 4
 * categories — labels, one-line blurbs, everything. Previously this same
 * grouping was hand-duplicated four separate times (the desktop Solutions
 * dropdown, the mobile menu's flat list, the homepage's own bespoke nav,
 * and nowhere consistent for a hub page) and had already drifted out of
 * sync between them. Consumed by marketing-nav-solutions.tsx,
 * marketing-mobile-menu.tsx, rebrand-hero.tsx, and the /solutions hub page
 * — change a label or add a page here once, not four times.
 */
export const SOLUTION_CATEGORIES: SolutionCategory[] = [
  {
    id: "your-platform",
    label: "Your Platform",
    description: "A website and bookstore that's yours",
    items: [
      { slug: "author-website-builder", label: "Author Website Builder", blurb: "Your own site, live in minutes, no code required." },
      { slug: "indie-author-bookstore", label: "Indie Author Bookstore", blurb: "Get discovered in the shared catalog of independent authors." },
    ],
  },
  {
    id: "sell-grow",
    label: "Sell & Grow",
    description: "Direct sales, courses, pre-orders, affiliates",
    items: [
      { slug: "sell-books-directly", label: "Sell Books Directly", blurb: "eBook, print, and audio — keep 100% of every sale." },
      { slug: "author-courses", label: "Sell Online Courses", blurb: "Turn your expertise into a second revenue stream." },
      { slug: "book-pre-orders", label: "Book Pre-Orders", blurb: "Build launch-day momentum before you publish." },
      { slug: "author-affiliate-program", label: "Affiliate Program", blurb: "Let fans and bloggers earn a commission selling for you." },
    ],
  },
  {
    id: "marketing-tools",
    label: "Marketing & Tools",
    description: "Newsletters, AI tools, your media kit",
    items: [
      { slug: "book-marketing-platform", label: "Book Marketing", blurb: "Campaigns and promotion built for indie authors." },
      { slug: "author-newsletter-platform", label: "Newsletter Platform", blurb: "Own your reader list — export it anytime, no one can take it." },
      { slug: "ai-tools-for-authors", label: "AI Tools for Authors", blurb: "Blurbs, blog ideas, and marketing copy, drafted for you." },
      { slug: "author-media-kit", label: "Author Media Kit", blurb: "A professional press kit, always ready to send." },
    ],
  },
  {
    id: "readers-analytics",
    label: "Readers & Analytics",
    description: "ARC copies, reader insight",
    items: [
      { slug: "arc-management", label: "ARC Management", blurb: "Build your review team and collect feedback pre-launch." },
      { slug: "reader-analytics-for-authors", label: "Reader Analytics", blurb: "See what's actually working, in plain numbers." },
    ],
  },
];
