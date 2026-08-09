import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PlansTable } from "@/components/super-admin/plans-table";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pricing plans and feature access for AuthorLoft authors.</p>
        </div>
        <Link
          href="/super-admin/plans/new"
          className="inline-flex items-center gap-2 rounded font-medium h-10 px-5 text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />New Plan
        </Link>
      </div>
      <PlansTable plans={plans} />
    </div>
  );
}