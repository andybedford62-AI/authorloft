import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(session.user.email.toLowerCase());
}

export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ gates: (config?.gates as Record<string, string>) ?? {} });
}

export async function PUT(req: NextRequest) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { gates } = await req.json();
  if (!gates || typeof gates !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const config = await prisma.planFeatureConfig.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", gates },
    update: { gates },
  });

  return NextResponse.json({ gates: config.gates });
}
