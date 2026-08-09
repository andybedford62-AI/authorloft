import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db";
import { requireSuperAdminId }       from "@/lib/super-admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { platform } = await params;

  try {
    await prisma.socialPlatformToken.delete({ where: { platform } });
  } catch {
    return NextResponse.json({ error: "Platform not connected." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
