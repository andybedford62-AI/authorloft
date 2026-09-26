// The exact hostnames an author's public site is served on, for filtering
// PostHog $pageview events by properties.$host in /api/admin/analytics.
//
// Exact matches only: a LIKE '%slug.authorloft.com%' pattern also matched
// every slug that merely ends with this one (author "bob" was credited with
// "jimbob.authorloft.com" traffic), and a hard-coded "authorloft.com" never
// matched staging's <slug>.staging.authorloft.com.

// Hostnames are letters, digits, dots and hyphens — anything else is dropped
// before the value is interpolated into HogQL.
function cleanHost(host: string): string {
  return host.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
}

export function authorSiteHosts(
  slug: string,
  customDomain: string | null | undefined,
  platformDomain: string,
): string[] {
  const hosts = new Set<string>();

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const safePlatform = cleanHost(platformDomain);
  if (safeSlug && safePlatform) hosts.add(`${safeSlug}.${safePlatform}`);

  // A custom domain can be reached with or without www., whichever way the
  // author saved it.
  const domain = customDomain ? cleanHost(customDomain) : "";
  if (domain) {
    const bare = domain.replace(/^www\./, "");
    hosts.add(bare);
    hosts.add(`www.${bare}`);
  }

  return [...hosts];
}

/** HogQL condition matching any of the hosts, e.g. properties.$host IN ('a', 'b'). */
export function hostInClause(hosts: string[]): string {
  if (hosts.length === 0) return "false";
  return `properties.$host IN (${hosts.map((h) => `'${cleanHost(h)}'`).join(", ")})`;
}
