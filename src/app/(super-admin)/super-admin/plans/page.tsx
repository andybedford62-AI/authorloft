//import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/db";
import Link from "next/link";
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
        <Link href="/super-admin/plans/new" className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors">
          <span>+</span> New Plan
        </Link>
      </div>
      <PlansTable plans={plans} />
    </div>
  );
}