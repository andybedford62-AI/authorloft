import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { validateCSRFToken, getCsrfSecret } from "@/lib/csrf";
import { auditLog, getAuditContext, shouldAuditRoute, getAuditAction } from "@/lib/audit-logger";

// AuthorLoft Multi-Tenant Middleware
// Handles subdomain routing: authorslug.authorloft.com → /author-site/[domain]
// Also handles custom domains mapped by authors
// Also enforces CSRF protection on state-changing requests

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
const PLATFORM_HOSTNAMES = [
  PLATFORM_DOMAIN,
  `www.${PLATFORM_DOMAIN}`,
  "localhost",
  "localhost:3000",
];

// Paths that must always be reachable even during maintenance
const MAINTENANCE_EXEMPT = [
  "/maintenance",
  "/api/maintenance-check",
  "/api/cron/",
];

// Endpoints that REQUIRE CSRF validation (starting with public checkout, expand later)
const CSRF_PROTECTED_PATHS = [
  "/api/checkout", // Public checkout — blocks CSRF order hijacking
];
// TODO: Add admin routes in Phase 2 after updating client code:
// - /api/admin/books
// - /api/admin/discount-codes
// - /api/admin/branding
// - /api/admin/settings
// - /api/admin/stripe/connect

// Endpoints explicitly exempt from CSRF (webhooks, public endpoints, read-only)
const CSRF_EXEMPT_PATHS = [
  "/api/stripe/webhook",
  "/api/auth/",
  "/api/checkout/validate-discount", // Read-only, no state change
];

// State-changing methods that require CSRF protection
const STATE_CHANGING_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // ── HTTPS Enforcement ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers.get("x-forwarded-proto");
    if (proto !== "https") {
      const httpsUrl = url.clone();
      httpsUrl.protocol = "https";
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // ── CSRF Protection ────────────────────────────────────────────────────────
  // Protect critical state-changing requests with CSRF validation
  if (STATE_CHANGING_METHODS.includes(req.method)) {
    const isExempt = CSRF_EXEMPT_PATHS.some((path) =>
      url.pathname.startsWith(path)
    );
    const isProtected = CSRF_PROTECTED_PATHS.some((path) =>
      url.pathname.startsWith(path)
    );

    // Only validate CSRF for explicitly protected routes or if not exempt
    if (isProtected && !isExempt) {
      const csrfToken = req.headers.get("x-csrf-token");
      const sessionToken = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // For protected routes with auth, require valid CSRF token
      if (sessionToken) {
        if (!csrfToken) {
          console.warn("[csrf] Missing CSRF token for protected request:", {
            pathname: url.pathname,
            method: req.method,
            userId: sessionToken.sub,
          });
          return NextResponse.json(
            { error: "Missing CSRF token" },
            { status: 403 }
          );
        }

        // Validate token
        const isValid = validateCSRFToken(
          csrfToken,
          sessionToken.sub || "",
          getCsrfSecret()
        );

        if (!isValid) {
          console.warn("[csrf] Invalid CSRF token for protected request:", {
            pathname: url.pathname,
            method: req.method,
            userId: sessionToken.sub,
          });
          return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
          );
        }
      }
    }
  }

  // ── Maintenance mode check ───────────────────────────────────────────────
  // Block ALL traffic when maintenance mode is active, except the maintenance
  // page itself and the check endpoint.
  const isExempt = MAINTENANCE_EXEMPT.some(
    (p) => url.pathname === p || url.pathname.startsWith(p)
  );
  if (!isExempt) {
    try {
      const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const res = await fetch(`${origin}/api/maintenance-check`, {
        signal: AbortSignal.timeout(3000),
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

  // ── Admin API auth guard (defense-in-depth) ─────────────────────────────
  // Edge-level JWT check before requests reach serverless functions.
  // Individual route handlers still perform their own auth checks.
  if (url.pathname.startsWith("/api/admin/") || url.pathname.startsWith("/api/super-admin/")) {
    const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (url.pathname.startsWith("/api/super-admin/") && !sessionToken.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── API routes always pass through ──────────────────────────────────────
  // Auth, webhooks, and all API routes must never be rewritten regardless of
  // which domain the request arrives on (platform, subdomain, or custom domain).
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── SEO files for ALL hosts ──────────────────────────────────────────────
  // /sitemap.xml and /robots.txt are rewritten to dedicated API handlers that
  // read the host header — this is done BEFORE the platform / subdomain split
  // because Next 16's metadata file routes (app/sitemap.ts, app/robots.ts)
  // were unreliably resolving at app root when the dynamic [domain] catch-all
  // also exists at root, intermittently 404ing the platform sitemap. The
  // internal handler now serves both platform and author hosts.
  if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
    const target = url.pathname === "/sitemap.xml"
      ? "/api/internal/sitemap"
      : "/api/internal/robots";
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = target;
    return NextResponse.rewrite(rewriteUrl);
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

  // ── Audit Logging ─────────────────────────────────────────────────────────
  // Log sensitive operations for forensics
  if (shouldAuditRoute(url.pathname, req.method)) {
    const sessionToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const auditContext = getAuditContext(req);

    auditLog({
      userId: sessionToken?.sub,
      action: getAuditAction(url.pathname),
      endpoint: url.pathname,
      method: req.method,
      ...auditContext,
    });
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
    // Apply to all routes except Next.js internals and static binary assets.
    // robots.txt and sitemap.xml must run through middleware so subdomain
    // rewrites can route them to the per-author handlers.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|woff|woff2|ttf|eot)$).*)",
  ],
};
