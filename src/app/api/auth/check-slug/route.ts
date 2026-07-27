import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { validateSlug } from "@/lib/reserved-slugs";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slug") ?? "";
  const slug = slugify(raw);

  const problem = validateSlug(slug);
  if (problem) {
    return NextResponse.json({ available: false, reason: problem });
  }

  const existing = await prisma.author.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing, slug });
}
