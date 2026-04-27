import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: { betaMode: true, betaMessage: true },
  });

  return NextResponse.json({
    betaMode:    config.betaMode,
    betaMessage: config.betaMessage,
  });
}
