import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function assertSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) return null;
  return session;
}

/** PATCH — update cap and/or reset counter for an author */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertSuperAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { aiUsageCap, resetCount } = await req.json();

  const data: Record<string, any> = {};

  if (typeof aiUsageCap === "number" && aiUsageCap >= 0) {
    data.aiUsageCap = aiUsageCap;
  }
  if (resetCount === true) {
    data.aiUsageCount  = 0;
    data.aiUsageResetAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.author.update({
    where:  { id },
    data,
    select: { aiUsageCount: true, aiUsageCap: true, aiUsageResetAt: true },
  });

  return NextResponse.json(updated);
}
