import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { SearchEnginesClient } from "./search-engines-client";

export default async function SearchEnginesPage() {
  const authorId = await getAdminAuthorId();

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      slug: true,
      customDomain: true,
      googleSiteVerification: true,
      bingSiteVerification: true,
    },
  });

  const baseUrl = getAuthorBaseUrl(author!);
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Engines</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get your author website discovered by Google, Bing, and other search engines.
        </p>
      </div>

      <SearchEnginesClient
        sitemapUrl={sitemapUrl}
        baseUrl={baseUrl}
        initialGoogle={author?.googleSiteVerification ?? ""}
        initialBing={author?.bingSiteVerification ?? ""}
      />
    </div>
  );
}
