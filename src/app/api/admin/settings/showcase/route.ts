import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const VALID_STYLES = ["photo", "book", "text"] as const;

// PATCH /api/admin/settings/showcase — update showcase opt-in and/or display style
export async function PATCH(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { showInShowcase, showcaseStyle } = body;

  if (showInShowcase !== undefined && typeof showInShowcase !== "boolean") {
    return NextResponse.json({ error: "showInShowcase must be a boolean" }, { status: 400 });
  }
  if (showcaseStyle !== undefined && !VALID_STYLES.includes(showcaseStyle)) {
    return NextResponse.json({ error: "Invalid showcaseStyle" }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data: {
      ...(showInShowcase !== undefined && { showInShowcase }),
      ...(showcaseStyle  !== undefined && { showcaseStyle }),
    },
  });

  return NextResponse.json({ ok: true, showInShowcase, showcaseStyle });
}

// GET /api/admin/settings/showcase — fetch current settings
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { showInShowcase: true, showcaseStyle: true },
  });

  return NextResponse.json({
    showInShowcase: author?.showInShowcase ?? false,
    showcaseStyle:  author?.showcaseStyle  ?? "photo",
  });
}
