import { prisma } from "@/lib/db";
import { Users, BookOpen, Mail } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { AuthorsTableClient } from "./authors-table-client";

export default async function SuperAdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      slug: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: true,
      lastLoginAt: true,
      plan: { select: { name: true, tier: true, monthlyPriceCents: true } },
      _count: {
        select: {
          books: true,
          subscribers: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalCents: true },
  });

  const stats = [
    { label: "Total Authors", value: authors.length, icon: Users },
    { label: "Active", value: authors.filter((a) => a.isActive).length, icon: Users },
    { label: "Total Books", value: authors.reduce((s, a) => s + a._count.books, 0), icon: BookOpen },
    { label: "Platform Revenue", value: formatCents(totalRevenue._sum.totalCents ?? 0), icon: Mail },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Authors</h1>
        <p className="text-sm text-gray-500 mt-1">Every author account on the AuthorLoft platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Icon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <AuthorsTableClient authors={authors} />
    </div>
  );
}
