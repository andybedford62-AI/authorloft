import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// GET /api/superadmin/legal — fetch current platform legal settings
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings ?? {});
}

// PATCH /api/superadmin/legal — update privacy or terms content
export async function PATCH(req: Request) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { field, content, contactEmail } = body as {
    field?: "privacy" | "terms";
    content?: string;
    contactEmail?: string;
  };

  const now = new Date();
  const data: Record<string, unknown> = {};

  if (field === "privacy") {
    data.privacyContent   = content ?? null;
    data.privacyUpdatedAt = now;
  } else if (field === "terms") {
    data.termsContent   = content ?? null;
    data.termsUpdatedAt = now;
  }

  if (contactEmail !== undefined) {
    data.contactEmail = contactEmail || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  // /privacy and /terms are prerendered at build time, so without this a save
  // only reached the live page on the next deploy — and a deploy could bake in
  // whatever was last saved, right or wrong (Sept 29 2026: Terms text pasted
  // into Privacy went live that way).
  if (field === "privacy" || contactEmail !== undefined) revalidatePath("/privacy");
  if (field === "terms" || contactEmail !== undefined) revalidatePath("/terms");

  return NextResponse.json(updated);
}
