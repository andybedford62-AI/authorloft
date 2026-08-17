import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint: returns the shared genre list so any author's newsletter
// sign-up form can offer them as interest options. Genres are one shared,
// platform-wide list (see docs/CHANGELOG.md Aug 17 2026) — no longer scoped
// to a particular author, so the authorId query param is no longer needed.
export async function GET() {
  const genres = await prisma.genre.findMany({
    select:  { id: true, name: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(genres);
}
