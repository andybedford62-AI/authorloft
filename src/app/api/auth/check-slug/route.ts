import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

const RESERVED = [
  "www", "app", "admin", "api", "cdn", "mail", "static", "blog",
  "help", "support", "about", "pricing", "login", "register",
  "dashboard", "superadmin", "authorloft",
];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slug") ?? "";
  const slug = slugify(raw);

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false, reason: "too_short" });
  }
  if (slug.length > 40) {
    return NextResponse.json({ available: false, reason: "too_long" });
  }
  if (RESERVED.includes(slug)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const existing = await prisma.author.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing, slug });
}
