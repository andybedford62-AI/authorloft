import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

export default async function robots({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<MetadataRoute.Robots> {
  const { domain } = await params;

  const author = await prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    select: { slug: true, customDomain: true },
  });

  if (!author) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const base = getAuthorBaseUrl(author);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
