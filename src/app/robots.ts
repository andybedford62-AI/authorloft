import type { MetadataRoute } from "next";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/register", "/accept-terms", "/forgot-password", "/reset-password/", "/verify-email/", "/arc/", "/orders/", "/maintenance"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
