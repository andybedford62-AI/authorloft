import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (!(session.user as any).isSuperAdmin) return null;
  return session;
}

// GET /api/superadmin/legal — fetch current platform legal settings
export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings ?? {});
}

// PATCH /api/superadmin/legal — update privacy or terms content
export async function PATCH(req: Request) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json(updated);
}
