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
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/super-admin", "/api/", "/_next"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog", "/news", "/bookstore", "/features", "/pricing", "/faq", "/resources", "/compare", "/llms.txt", "/llms-full.txt"],
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog", "/news", "/bookstore", "/features", "/pricing", "/faq", "/resources", "/compare", "/llms.txt", "/llms-full.txt"],
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog", "/news", "/bookstore", "/features", "/pricing", "/faq", "/resources", "/compare", "/llms.txt", "/llms-full.txt"],
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog", "/news", "/bookstore", "/features", "/pricing", "/faq", "/resources", "/compare", "/llms.txt", "/llms-full.txt"],
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/blog", "/news", "/bookstore", "/features", "/pricing", "/faq", "/resources", "/compare"],
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/super-admin", "/api/", "/auth/", "/orders/", "/_next"],
      },
    ],
    sitemap: `https://www.${platformDomain}/sitemap.xml`,
  };
}
