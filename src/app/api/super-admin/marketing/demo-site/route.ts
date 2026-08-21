import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

/** GET — the currently selected demo author, plus the full author picker list */
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [settings, authors] = await Promise.all([
    prisma.platformSettings.upsert({
      where:  { id: "singleton" },
      create: { id: "singleton" },
      update: {},
      select: { demoAuthorId: true },
    }),
    prisma.author.findMany({
      select: { id: true, name: true, slug: true, customDomain: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ demoAuthorId: settings.demoAuthorId, authors });
}

/** PATCH — set (or clear, with null) which author's site the demo links point to */
export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { demoAuthorId } = await req.json();

  if (demoAuthorId) {
    const author = await prisma.author.findUnique({ where: { id: demoAuthorId }, select: { id: true } });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
  }

  await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", demoAuthorId: demoAuthorId || null },
    update: { demoAuthorId: demoAuthorId || null },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, demoAuthorId: demoAuthorId || null });
}
