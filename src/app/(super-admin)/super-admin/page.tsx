//import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const [totalAuthors, totalPlans, planBreakdown] = await Promise.all([
    prisma.author.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.plan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, badgeColor: true, _count: { select: { subscriptions: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const badgeClass: Record<string, string> = {
    gray: "bg-gray-700 text-gray-300",
    blue: "bg-blue-900 text-blue-300",
    purple: "bg-purple-900 text-purple-300",
    gold: "bg-yellow-900 text-yellow-300",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <p className="text-sm text-gray-400 mb-1">Total Authors</p>
          <p className="text-3xl font-bold text-white">{totalAuthors}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <p className="text-sm text-gray-400 mb-1">Active Plans</p>
          <p className="text-3xl font-bold text-white">{totalPlans}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <p className="text-sm text-gray-400 mb-1">On Paid Plans</p>
          <p className="text-3xl font-bold text-white">
            {planBreakdown.filter((p) => !["free"].includes(p.name.toLowerCase())).reduce((sum, p) => sum + p._count.subscriptions, 0)}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Subscribers by Plan</h2>
          <Link href="/super-admin/plans" className="text-sm text-purple-400 hover:text-purple-300">Manage Plans →</Link>
        </div>
        <div className="space-y-3">
          {planBreakdown.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass[plan.badgeColor] ?? badgeClass.gray}`}>{plan.name}</span>
              <span className="text-white font-medium">{plan._count.subscriptions} <span className="text-gray-500 font-normal text-sm">subscriber{plan._count.subscriptions !== 1 ? "s" : ""}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}