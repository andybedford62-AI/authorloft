/**
 * Canonical URL helpers for author sites.
 *
 * Author sites live on subdomains:
 *   local dev  → http://slug.localhost:3000
 *   production → https://slug.authorloft.com   (or custom domain)
 */

export function getAuthorBaseUrl(author: {
  slug: string;
  customDomain?: string | null;
}): string {
  if (author.customDomain) {
    return `https://${author.customDomain}`;
  }

  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "3000";
    return `http://${author.slug}.localhost:${port}`;
  }

  return `https://${author.slug}.${platformDomain}`;
}
