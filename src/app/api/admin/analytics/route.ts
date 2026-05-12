import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

// Derive REST API host from the ingest host env var
// us.i.posthog.com → us.posthog.com / eu.i.posthog.com → eu.posthog.com
const region = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "").includes("eu") ? "eu" : "us";
const POSTHOG_API_HOST = `https://${region}.posthog.com`;

async function queryPostHog(sql: string) {
  const res = await fetch(
    `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: sql } }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog query failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return NextResponse.json({ error: "Analytics not configured" }, { status: 503 });
  }

  const days = Math.min(parseInt(req.nextUrl.searchParams.get("days") ?? "30"), 90);

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true, customDomain: true },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate slug/domain before interpolating into HogQL (slugs are alphanumeric + hyphens)
  const safeSlug = author.slug.replace(/[^a-z0-9-]/gi, "");
  const safeCustomDomain = author.customDomain?.replace(/[^a-z0-9.-]/gi, "") ?? null;

  const hostFilter = safeCustomDomain
    ? `(properties.$host LIKE '%${safeSlug}.authorloft.com%' OR properties.$host = '${safeCustomDomain}')`
    : `properties.$host LIKE '%${safeSlug}.authorloft.com%'`;

  const baseWhere = `event = '$pageview' AND ${hostFilter} AND timestamp >= now() - interval ${days} day`;

  const [trendData, topPagesData, referrersData, geoData] = await Promise.all([
    queryPostHog(
      `SELECT toDate(timestamp) as date, count() as views
       FROM events WHERE ${baseWhere}
       GROUP BY date ORDER BY date ASC`
    ),
    queryPostHog(
      `SELECT replaceRegexpOne(properties.$current_url, 'https?://[^/]+', '') as path, count() as views
       FROM events WHERE ${baseWhere}
       GROUP BY path ORDER BY views DESC LIMIT 15`
    ),
    queryPostHog(
      `SELECT coalesce(nullIf(properties.$referring_domain, ''), 'Direct') as source, count() as views
       FROM events WHERE ${baseWhere}
       GROUP BY source ORDER BY views DESC LIMIT 10`
    ),
    queryPostHog(
      `SELECT coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') as country, count() as views
       FROM events WHERE ${baseWhere}
       GROUP BY country ORDER BY views DESC LIMIT 10`
    ),
  ]);

  const totalViews: number =
    trendData.results?.reduce((sum: number, row: any[]) => sum + (Number(row[1]) || 0), 0) ?? 0;

  return NextResponse.json({
    totalViews,
    trend:     trendData.results?.map((r: any[]) => ({ date: r[0] as string, views: Number(r[1]) || 0 })) ?? [],
    topPages:  topPagesData.results?.map((r: any[]) => ({ path: (r[0] as string) || "/", views: Number(r[1]) || 0 })) ?? [],
    referrers: referrersData.results?.map((r: any[]) => ({ source: r[0] as string, views: Number(r[1]) || 0 })) ?? [],
    geography: geoData.results?.map((r: any[]) => ({ country: r[0] as string, views: Number(r[1]) || 0 })) ?? [],
  });
}
