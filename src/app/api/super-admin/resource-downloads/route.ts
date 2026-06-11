import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.resourceDownload.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.title?.trim())   return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!b.fileUrl?.trim()) return NextResponse.json({ error: "A file URL is required." }, { status: 400 });
  if (!b.category?.trim()) return NextResponse.json({ error: "A category is required." }, { status: 400 });

  const slug = slugify(b.slug?.trim() || b.title);
  if (!slug) return NextResponse.json({ error: "Could not derive a valid slug." }, { status: 400 });

  const max = await prisma.resourceDownload.aggregate({ _max: { displayOrder: true } });
  try {
    const row = await prisma.resourceDownload.create({
      data: {
        title:         b.title.trim(),
        slug,
        description:   b.description?.trim() || null,
        body:          b.body?.trim() || null,
        category:      b.category.trim(),
        fileUrl:       b.fileUrl.trim(),
        coverImageUrl: b.coverImageUrl?.trim() || null,
        requiresEmail: b.requiresEmail ?? true,
        isPublished:   b.isPublished ?? true,
        displayOrder:  b.displayOrder ?? (max._max.displayOrder ?? -1) + 1,
        publishedAt:   (b.isPublished ?? true) ? new Date() : null,
      },
    });
    revalidatePath("/resources");
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: `A download with slug "${slug}" already exists.` }, { status: 409 });
    throw e;
  }
}
