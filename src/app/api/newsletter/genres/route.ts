import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint: returns an author's genres so the newsletter sign-up form
// can offer them as interest options. Genres are already public (shown on the
// author site), so no auth is required — but we only expose id + name.
export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get("authorId");
  if (!authorId) {
    return NextResponse.json({ error: "authorId is required" }, { status: 400 });
  }

  const genres = await prisma.genre.findMany({
    where:   { authorId },
    select:  { id: true, name: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(genres);
}
