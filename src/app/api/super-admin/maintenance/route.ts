import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where: { id: "main" },
    create: { id: "main", maintenanceMode: false, maintenanceMessage: "" },
    update: {},
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const config = await prisma.systemConfig.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      maintenanceMode: body.maintenanceMode ?? false,
      maintenanceMessage: body.maintenanceMessage ?? "",
    },
    update: {
      ...(body.maintenanceMode !== undefined && { maintenanceMode: body.maintenanceMode }),
      ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage }),
    },
  });
  // Flush the maintenance-check endpoint cache
  revalidatePath("/api/maintenance-check");
  return NextResponse.json(config);
}
