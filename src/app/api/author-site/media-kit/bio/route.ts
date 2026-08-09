import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripHtml } from "@/lib/media-kit-pdf";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const author = await prisma.author.findFirst({
    where: { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
    select: {
      slug: true, name: true, displayName: true,
      pressBio: true, bio: true, shortBio: true,
      plan: { select: { mediaKitEnabled: true } },
    },
  });
  if (!author?.plan?.mediaKitEnabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authorName = author.displayName || author.name;
  const bio = stripHtml(author.pressBio || author.bio || author.shortBio || "");

  return new NextResponse(bio || "No biography available.", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${authorName.replace(/\s+/g, "-")}-biography.txt"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
