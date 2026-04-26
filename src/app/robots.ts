import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/super-admin", "/api/"],
      },
    ],
    sitemap: `https://www.${platformDomain}/sitemap.xml`,
  };
}
