export const dynamic = "force-dynamic";

import {
  getAuthorByDomain,
  getAuthorBooks,
  getAuthorSeries,
  getAuthorGenres,
} from "@/lib/author-queries";
import { ClassicTemplate } from "@/components/author-site/templates/classic";
import { MinimalTemplate } from "@/components/author-site/templates/minimal";
import { BoldTemplate } from "@/components/author-site/templates/bold";
import type { HomeTemplateProps } from "@/components/author-site/templates/types";

export default async function AuthorHomePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const [books, series, genreTree] = await Promise.all([
    getAuthorBooks(author.id),
    getAuthorSeries(author.id),
    getAuthorGenres(author.id),
  ]);

  const props = { author, books, series, genreTree } as unknown as HomeTemplateProps;

  switch (author.homeTemplate) {
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "bold":
      return <BoldTemplate {...props} />;
    default:
      return <ClassicTemplate {...props} />;
  }
}
