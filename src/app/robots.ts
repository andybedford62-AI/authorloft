import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/bookstore", "/blog", "/news", "/features", "/pricing", "/contact", "/privacy", "/terms", "/gdpr"],
        disallow: [
          "/admin",
          "/super-admin",
          "/api/",
          "/auth/",
          "/orders/",
          "/_next",
          "/maintenance",
          "/arc/",
        ],
      },
      // Google bot gets full access
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/super-admin", "/api/", "/_next"],
      },
    ],
    sitemap: `https://www.${platformDomain}/sitemap.xml`,
  };
}
