import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.socialPromoteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const {
    enabled, model, timeoutMs, maxOutputTokens,
    costWarnCentsPerDay, costDisableCentsPerDay, adminAlertEmails,
  } = body;

  const data: Record<string, unknown> = {};
  if (enabled                !== undefined) data.enabled                = !!enabled;
  if (model                  !== undefined) {
    if (typeof model !== "string" || !model.trim()) {
      return NextResponse.json({ error: "Model is required." }, { status: 400 });
    }
    data.model = model.trim();
  }
  if (timeoutMs              !== undefined) {
    if (typeof timeoutMs !== "number" || timeoutMs < 1000 || timeoutMs > 120000) {
      return NextResponse.json({ error: "Timeout must be between 1000 and 120000 ms." }, { status: 400 });
    }
    data.timeoutMs = timeoutMs;
  }
  if (maxOutputTokens        !== undefined) {
    if (typeof maxOutputTokens !== "number" || maxOutputTokens < 50 || maxOutputTokens > 4000) {
      return NextResponse.json({ error: "Max output tokens must be between 50 and 4000." }, { status: 400 });
    }
    data.maxOutputTokens = maxOutputTokens;
  }
  if (costWarnCentsPerDay    !== undefined) {
    if (typeof costWarnCentsPerDay !== "number" || costWarnCentsPerDay < 0) {
      return NextResponse.json({ error: "Cost warn ceiling must be a non-negative number." }, { status: 400 });
    }
    data.costWarnCentsPerDay = costWarnCentsPerDay;
  }
  if (costDisableCentsPerDay !== undefined) {
    if (typeof costDisableCentsPerDay !== "number" || costDisableCentsPerDay < 0) {
      return NextResponse.json({ error: "Cost disable ceiling must be a non-negative number." }, { status: 400 });
    }
    data.costDisableCentsPerDay = costDisableCentsPerDay;
  }
  if (adminAlertEmails       !== undefined) {
    if (typeof adminAlertEmails !== "string") {
      return NextResponse.json({ error: "Alert emails must be a string." }, { status: 400 });
    }
    data.adminAlertEmails = adminAlertEmails.trim();
  }

  const updated = await prisma.socialPromoteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  return NextResponse.json(updated);
}
