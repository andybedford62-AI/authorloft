// The named person behind AuthorLoft's own articles (blog, news, guides).
// Drives the /author/[slug] page and the Person node in every article's JSON-LD.
// sameAs lists only profiles he runs himself.

export const PLATFORM_BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const PLATFORM_AUTHOR = {
  slug: "anthony-bedford",
  name: "Anthony Bedford",
  jobTitle: "Thriller author and founder of AuthorLoft",
  sameAs: ["https://www.linkedin.com/in/anthonybedford/"],
};

export const PLATFORM_AUTHOR_URL = `${PLATFORM_BASE}/author/${PLATFORM_AUTHOR.slug}`;

/** True when an article byline names the founder, so the byline can link to his author page. */
export function isPlatformAuthor(name: string | null | undefined): boolean {
  return !!name && name.trim().toLowerCase() === PLATFORM_AUTHOR.name.toLowerCase();
}

/** JSON-LD `author` for an article: a Person with a url for the founder, a plain Person otherwise. */
export function articleAuthorLd(name: string) {
  if (isPlatformAuthor(name)) {
    return {
      "@type": "Person",
      name: PLATFORM_AUTHOR.name,
      url: PLATFORM_AUTHOR_URL,
      jobTitle: PLATFORM_AUTHOR.jobTitle,
      ...(PLATFORM_AUTHOR.sameAs.length > 0 && { sameAs: PLATFORM_AUTHOR.sameAs }),
    };
  }
  return { "@type": "Organization", name };
}
