import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: { welcomeEmailSubject: true, welcomeEmailBody: true },
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { welcomeEmailSubject, welcomeEmailBody } = await req.json();
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main", welcomeEmailSubject, welcomeEmailBody },
    update: {
      ...(welcomeEmailSubject !== undefined && { welcomeEmailSubject }),
      ...(welcomeEmailBody    !== undefined && { welcomeEmailBody    }),
    },
    select: { welcomeEmailSubject: true, welcomeEmailBody: true },
  });
  return NextResponse.json(config);
}
