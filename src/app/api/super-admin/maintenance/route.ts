import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(session.user.email.toLowerCase());
}

export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where: { id: "main" },
    create: { id: "main", maintenanceMode: false, maintenanceMessage: "" },
    update: {},
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
