//import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PlanForm } from "@/components/super-admin/plan-form";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Plan — {plan.name}</h1>
        <p className="text-sm text-gray-400 mt-1">Changes take effect immediately for all authors on this plan.</p>
      </div>
      <PlanForm plan={plan} />
    </div>
  );
}