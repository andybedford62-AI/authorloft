import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SEO_PAGES } from "@/lib/seo-config";

const validPageIds = SEO_PAGES.map(p => p.id);

// PATCH /api/super-admin/seo/[page] — update OG image URL
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { page } = await params;
  if (!validPageIds.includes(page as any)) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  const { url } = await req.json();
  const pageInfo = SEO_PAGES.find(p => p.id === page)!;

  await prisma.seoConfig.upsert({
    where:  { id: page },
    create: { id: page, ogImageUrl: url || null },
    update: { ogImageUrl: url || null },
  });

  revalidatePath(pageInfo.path);
  return NextResponse.json({ ok: true, url: url || null });
}

// DELETE /api/super-admin/seo/[page] — clear OG image (revert to default)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { page } = await params;
  if (!validPageIds.includes(page as any)) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  const pageInfo = SEO_PAGES.find(p => p.id === page)!;

  await prisma.seoConfig.upsert({
    where:  { id: page },
    create: { id: page, ogImageUrl: null },
    update: { ogImageUrl: null },
  });

  revalidatePath(pageInfo.path);
  return NextResponse.json({ ok: true });
}
