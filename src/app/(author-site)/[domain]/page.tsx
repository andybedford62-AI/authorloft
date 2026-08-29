export const dynamic = "force-dynamic";

import {
  getAuthorByDomain,
  getAuthorBooks,
  getAuthorSeries,
  getAuthorGenres,
  getAuthorCourses,
  getAuthorMusic,
  getAuthorContentPresence,
} from "@/lib/author-queries";
import { resolveHeroFocus } from "@/lib/site-pages";
import { ClassicTemplate } from "@/components/author-site/templates/classic";
import { MinimalTemplate } from "@/components/author-site/templates/minimal";
import { BoldTemplate } from "@/components/author-site/templates/bold";
import { CinematicTemplate } from "@/components/author-site/templates/cinematic";
import { getAuthorBaseUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import type { HomeTemplateProps } from "@/components/author-site/templates/types";

// Title/description/OG all come from the layout; this only claims the
// canonical, which the layout deliberately no longer sets.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  return { alternates: { canonical: getAuthorBaseUrl(author) } };
}

export default async function AuthorHomePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const [books, series, genreTree, courses, music, presence] = await Promise.all([
    getAuthorBooks(author.id),
    getAuthorSeries(author.id),
    getAuthorGenres(author.id),
    getAuthorCourses(author.id),
    getAuthorMusic(author.id),
    getAuthorContentPresence(author.id),
  ]);
  const heroFocus = resolveHeroFocus(author.heroFocus, presence) ?? "BOOKS";

  const props = {
    author: { ...author, heroFocus },
    books,
    courses,
    music,
    series,
    genreTree,
  } as unknown as HomeTemplateProps;

  switch (author.homeTemplate) {
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "bold":
      return <BoldTemplate {...props} />;
    case "cinematic":
      return <CinematicTemplate {...props} />;
    default:
      return <ClassicTemplate {...props} />;
  }
}
