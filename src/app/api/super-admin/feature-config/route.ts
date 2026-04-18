import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TIER_RANK, FEATURE_PLAN_MAP } from "@/lib/feature-gates";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(session.user.email.toLowerCase());
}

// ── Cascade: update Plan model fields to match the saved gates ────────────────
//
// For each feature that has a corresponding Plan field (e.g. flipBooksLimit),
// we update every Plan record so the public author site stays in sync
// with whatever the Feature Gates config says.
//
// Rules:
//   DISABLED → all plans get the disabled value (hidden everywhere)
//   PREMIUM  → only PREMIUM plan gets the enabled value
//   STANDARD → STANDARD + PREMIUM get the enabled value; FREE gets disabled
//   FREE     → all plans get the enabled value

async function cascadeToPlanFields(gates: Record<string, string>) {
  const plans = await prisma.plan.findMany({ select: { id: true, tier: true } });

  for (const plan of plans) {
    const planRank = TIER_RANK[plan.tier] ?? 0;
    const updateData: Record<string, unknown> = {};

    for (const [featureKey, requiredTier] of Object.entries(gates)) {
      const mapping = FEATURE_PLAN_MAP[featureKey];
      if (!mapping) continue; // admin-only feature, nothing to update on Plan

      const hasAccess =
        requiredTier !== "DISABLED" &&
        planRank >= (TIER_RANK[requiredTier] ?? 0);

      updateData[mapping.field] = hasAccess ? mapping.enabledValue : mapping.disabledValue;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.plan.update({ where: { id: plan.id }, data: updateData });
    }
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

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

  // 1. Save the gate config
  const config = await prisma.planFeatureConfig.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", gates },
    update: { gates },
  });

  // 2. Cascade to Plan model fields so public site stays in sync
  await cascadeToPlanFields(gates);

  return NextResponse.json({ gates: config.gates });
}
