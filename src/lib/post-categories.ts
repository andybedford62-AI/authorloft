// Suggested categories for the Blog & News CMS. These seed the editor's
// category datalist; existing categories already in use are merged in too,
// and authors can still type a custom value. Public filter chips reflect
// whatever categories actually appear on published posts.

export const SUGGESTED_NEWS_CATEGORIES = [
  "Announcements",
  "Product Updates",
  "New Features",
  "Specials",
  "Events",
  "Company",
];

export const SUGGESTED_BLOG_CATEGORIES = [
  "Author Tips",
  "Guides",
  "Marketing",
  "Selling Direct",
  "Publishing",
  "Case Studies",
];

export const ALL_SUGGESTED_CATEGORIES = Array.from(
  new Set([...SUGGESTED_NEWS_CATEGORIES, ...SUGGESTED_BLOG_CATEGORIES])
);
