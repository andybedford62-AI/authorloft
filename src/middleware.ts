import { NextRequest, NextResponse } from "next/server";

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  // Strip port (handles local dev on slug.localhost:3000)
  const host = hostname.split(":")[0];

  // Detect subdomain: demo.authorloft.com → subdomain = "demo"
  // Ignore www.authorloft.com and authorloft.com (marketing site)
  const isSubdomain =
    host.endsWith(`.${PLATFORM_DOMAIN}`) &&
    host !== `www.${PLATFORM_DOMAIN}` &&
    host !== PLATFORM_DOMAIN;

  if (isSubdomain) {
    const subdomain = host.replace(`.${PLATFORM_DOMAIN}`, "");
    const url = req.nextUrl.clone();
    // Rewrite: demo.authorloft.com/books → internally /demo/books
    url.pathname = `/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals
    "/((?!_next/|_vercel/|favicon\\.ico).*)",
  ],
};
