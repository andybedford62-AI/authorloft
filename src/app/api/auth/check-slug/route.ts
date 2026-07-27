import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { checkSlugAvailability } from "@/lib/slug-availability";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slug") ?? "";
  const slug = slugify(raw);

  const reason = await checkSlugAvailability(slug);
  if (reason) {
    return NextResponse.json({ available: false, reason });
  }

  return NextResponse.json({ available: true, slug });
}
