import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
// Short cache so middleware doesn't hammer the DB — 15s is enough
export const revalidate = 15;

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "main" } });
    return NextResponse.json({
      maintenanceMode: config?.maintenanceMode ?? false,
      maintenanceMessage: config?.maintenanceMessage ?? "",
    });
  } catch {
    // Fail open — don't lock everyone out if DB hiccups
    return NextResponse.json({ maintenanceMode: false, maintenanceMessage: "" });
  }
}
