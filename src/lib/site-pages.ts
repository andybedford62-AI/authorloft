// Builds the list of live public pages for an author's site, matching the
// links shown in their site nav (see components/author-site/nav.tsx).

export interface AuthorSitePage {
  label: string;
  path: string;
}

export interface AuthorNavFlags {
  navShowAbout: boolean;
  navShowBooks: boolean;
  navShowSpecials: boolean;
  navShowFlipBooks: boolean;
  navShowBlog: boolean;
  navShowContact: boolean;
  navShowMediaKit: boolean;
  navShowCourses: boolean;
  navShowBundles: boolean;
  plan?: { flipBooksLimit: number; mediaKitEnabled: boolean; coursesEnabled: boolean; bundlesEnabled: boolean } | null;
}

export interface AuthorCustomPage {
  slug: string;
  title: string;
  navTitle: string | null;
}

export function getAuthorSitePages(
  author: AuthorNavFlags,
  customPages: AuthorCustomPage[] = []
): AuthorSitePage[] {
  const pages: AuthorSitePage[] = [{ label: "Home", path: "/" }];

  if (author.navShowBooks) pages.push({ label: "Books", path: "/books" });
  if (author.plan?.bundlesEnabled && author.navShowBundles) {
    // Bundles is now a tab on /books (see books-bundles-tabs.tsx), not its
    // own page -- link straight there instead of through the /bundles redirect.
    pages.push({ label: "Bundles", path: "/books?tab=bundles" });
  }
  if (author.plan?.coursesEnabled && author.navShowCourses) {
    pages.push({ label: "Courses", path: "/courses" });
  }
  if (author.navShowSpecials) pages.push({ label: "Specials", path: "/specials" });
  if ((author.plan?.flipBooksLimit ?? 0) !== 0 && author.navShowFlipBooks) {
    pages.push({ label: "Flip Books", path: "/flip-books" });
  }
  if (author.navShowBlog) pages.push({ label: "News", path: "/blog" });

  for (const page of customPages) {
    pages.push({ label: page.navTitle || page.title, path: `/${page.slug}` });
  }

  if (author.navShowAbout) pages.push({ label: "About", path: "/about" });
  if (author.navShowContact) pages.push({ label: "Contact", path: "/contact" });
  if (author.plan?.mediaKitEnabled && author.navShowMediaKit) {
    // Media Kit is now a tab on /about (see about-media-kit-tabs.tsx), not
    // its own page -- link straight there instead of through the redirect.
    pages.push({ label: "Media Kit", path: "/about?tab=media-kit" });
  }

  return pages;
}
