import { NextRequest, NextResponse } from "next/server";

// AuthorLoft Multi-Tenant Middleware
// Handles subdomain routing: authorslug.authorloft.com → /author-site/[domain]
// Also handles custom domains mapped by authors

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
const PLATFORM_HOSTNAMES = [
  PLATFORM_DOMAIN,
  `www.${PLATFORM_DOMAIN}`,
  "localhost",
  "localhost:3000",
];

const MAINTENANCE_PATHS = ["/login", "/register", "/api/auth/signin", "/api/auth/callback"];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // ── Maintenance mode check ───────────────────────────────────────────────
  // Block logins/registrations when maintenance mode is active.
  const isMaintPath = MAINTENANCE_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"));
  if (isMaintPath) {
    try {
      const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const res = await fetch(`${origin}/api/maintenance-check`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json() as { maintenanceMode: boolean };
        if (data.maintenanceMode) {
          return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      }
    } catch {
      // Fail open — DB hiccup should not lock everyone out
    }
  }

  // Strip port for local dev comparison
  const hostnameWithoutPort = hostname.split(":")[0];

  // ── API routes always pass through ──────────────────────────────────────
  // Auth, webhooks, and all API routes must never be rewritten regardless of
  // which domain the request arrives on (platform, subdomain, or custom domain).
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── Platform / Admin routes ──────────────────────────────────────────────
  // If the hostname is the root platform domain (or localhost), serve normally.
  // Next.js App Router handles (marketing), (admin), (superadmin), (auth) groups.
  // Also treat *.vercel.app as a platform host during staging / pre-domain setup.
  const isVercelHost = hostname.endsWith(".vercel.app") || hostname === "vercel.app";

  if (
    PLATFORM_HOSTNAMES.includes(hostname) ||
    PLATFORM_HOSTNAMES.includes(hostnameWithoutPort) ||
    isVercelHost
  ) {
    return NextResponse.next();
  }

  // ── Subdomain routes ─────────────────────────────────────────────────────
  // e.g. apbedford.authorloft.com → rewrite to /(author-site)/apbedford/...
  const isSubdomain =
    hostname.endsWith(`.${PLATFORM_DOMAIN}`) ||
    hostname.endsWith(`.localhost`) ||
    // Local dev: anything.localhost:3000
    /^[a-z0-9-]+\.localhost(:\d+)?$/.test(hostname);

  if (isSubdomain) {
    const slug = hostnameWithoutPort.split(".")[0];

    // Don't rewrite reserved subdomains
    const reservedSlugs = ["www", "app", "admin", "api", "cdn", "mail", "static"];
    if (reservedSlugs.includes(slug)) {
      return NextResponse.next();
    }

    // Rewrite /anything → /(author-site)/[slug]/anything
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/${slug}${url.pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── Custom domain routes ─────────────────────────────────────────────────
  // Any other hostname is treated as a custom domain mapped to an author.
  // We rewrite to a special path that the server uses to look up the author.
  const rewriteUrl = url.clone();
  rewriteUrl.pathname = `/custom-domain/${hostname}${url.pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
