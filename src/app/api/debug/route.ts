import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars (non-sensitive)
  results.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "NOT SET";
  results.NEXT_PUBLIC_PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "NOT SET";
  results.NEXTAUTH_SECRET_SET = !!process.env.NEXTAUTH_SECRET;
  results.NEXTAUTH_SECRET_LENGTH = process.env.NEXTAUTH_SECRET?.length ?? 0;
  results.DATABASE_URL_SET = !!process.env.DATABASE_URL;
  results.NODE_ENV = process.env.NODE_ENV;

  // Try DB connection
  try {
    const authorCount = await prisma.author.count();
    results.db_connected = true;
    results.author_count = authorCount;
  } catch (err: unknown) {
    results.db_connected = false;
    results.db_error = err instanceof Error ? err.message : String(err);
  }

  // Try fetching the specific author
  try {
    const author = await prisma.author.findUnique({
      where: { email: "andybedford62@gmail.com" },
      include: { plan: true },
    });
    results.author_found = !!author;
    results.author_has_hash = !!author?.passwordHash;
    results.author_plan = author?.plan?.tier ?? "no plan";
  } catch (err: unknown) {
    results.author_query_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
