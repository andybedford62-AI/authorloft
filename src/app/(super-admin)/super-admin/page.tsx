import { prisma } from "@/lib/db";
import Link from "next/link";
import { PlatformSitePagesCard } from "@/components/super-admin/platform-site-pages-card";

export default async function SuperAdminDashboard() {
  const baseUrl = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;
  const [totalAuthors, totalPlans, planBreakdown, blogCount, newsCount, guideCount] = await Promise.all([
    prisma.author.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.plan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, badgeColor: true, _count: { select: { authors: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.platformPost.count({ where: { isPublished: true, isNews: false } }),
    prisma.platformPost.count({ where: { isPublished: true, isNews: true } }),
    prisma.guide.count({ where: { isPublished: true } }),
  ]);

  const badgeClass: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gold: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Authors, plans and public pages across AuthorLoft.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Authors</p>
          <p className="text-3xl font-bold text-gray-900">{totalAuthors}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active Plans</p>
          <p className="text-3xl font-bold text-gray-900">{totalPlans}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">On Paid Plans</p>
          <p className="text-3xl font-bold text-gray-900">
            {planBreakdown.filter((p) => !["free"].includes(p.name.toLowerCase())).reduce((sum, p) => sum + p._count.authors, 0)}
          </p>
        </div>
      </div>

      <PlatformSitePagesCard
        baseUrl={baseUrl}
        counts={{ "/blog": blogCount, "/news": newsCount, "/guides": guideCount }}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Authors by Plan</h2>
          <Link href="/super-admin/plans" className="text-sm text-purple-600 hover:text-purple-700">Manage Plans →</Link>
        </div>
        <div className="space-y-3">
          {planBreakdown.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass[plan.badgeColor] ?? badgeClass.gray}`}>{plan.name}</span>
              <span className="text-gray-900 font-medium">{plan._count.authors} <span className="text-gray-500 font-normal text-sm">author{plan._count.authors !== 1 ? "s" : ""}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
