import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: { betaMode: true, betaMessage: true, newSignupNotifications: true, signupNotificationEmail: true },
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {
      ...(body.betaMode                !== undefined && { betaMode:                body.betaMode                }),
      ...(body.betaMessage             !== undefined && { betaMessage:             body.betaMessage             }),
      ...(body.newSignupNotifications  !== undefined && { newSignupNotifications:  body.newSignupNotifications  }),
      ...(body.signupNotificationEmail !== undefined && { signupNotificationEmail: body.signupNotificationEmail }),
    },
    select: { betaMode: true, betaMessage: true, newSignupNotifications: true, signupNotificationEmail: true },
  });
  return NextResponse.json(config);
}
