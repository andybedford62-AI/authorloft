import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  BookOpen, Users, ShoppingBag, TrendingUp,
  Plus, ArrowRight, Star, MailWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import { EmailVerificationBanner } from "@/components/admin/email-verification-banner";

async function getDashboardData(authorId: string) {
  const [
    totalBooks,
    totalSubscribers,
    revenueResult,
    ordersThisMonth,
    recentOrders,
    books,
    plan,
  ] = await Promise.all([
    // Total published books
    prisma.book.count({ where: { authorId, isPublished: true } }),

    // Total newsletter subscribers
    prisma.subscriber.count({ where: { authorId } }),

    // Total revenue from completed orders
    prisma.order.aggregate({
      where: { authorId, status: "COMPLETED" },
      _sum: { totalCents: true },
    }),

    // Orders this calendar month
    prisma.order.count({
      where: {
        authorId,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // 5 most recent completed orders
    prisma.order.findMany({
      where: { authorId, status: "COMPLETED" },
      include: { items: { include: { book: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // All books for the list
    prisma.book.findMany({
      where: { authorId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, priceCents: true, isFeatured: true, isPublished: true },
    }),

    // Author plan
    prisma.author.findUnique({
      where: { id: authorId },
      include: { plan: true },
    }),
  ]);

  return {
    totalBooks,
    totalSubscribers,
    totalRevenueCents: revenueResult._sum.totalCents ?? 0,
    ordersThisMonth,
    recentOrders,
    books,
    planName: plan?.plan?.name ?? "Free",
    planFeatures: plan?.plan
      ? [
          (plan.plan.maxBooks === -1 || plan.plan.maxBooks === null) ? "Unlimited books" : `Up to ${plan.plan.maxBooks} books`,
          plan.plan.customDomain ? "Custom domain" : null,
          plan.plan.salesEnabled ? "Sales enabled" : null,
        ].filter(Boolean)
      : ["Up to 5 books"],
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const authorId = (session?.user as any)?.id;

  // Fallback for demo mode (no DB)
  if (!authorId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Not authenticated. <Link href="/login" className="text-blue-600 underline">Sign in</Link>
      </div>
    );
  }

  const [data, authorMeta] = await Promise.all([
    getDashboardData(authorId),
    prisma.author.findUnique({
      where: { id: authorId },
      select: { emailVerified: true, email: true },
    }),
  ]);

  const statCards = [
    { label: "Total Books",            value: data.totalBooks,                     icon: BookOpen,    color: "blue",   href: "/admin/books" },
    { label: "Newsletter Subscribers", value: data.totalSubscribers,               icon: Users,       color: "green",  href: "/admin/newsletter" },
    { label: "Revenue (All Time)",     value: formatCents(data.totalRevenueCents), icon: TrendingUp,  color: "purple", href: "/admin/sales" },
    { label: "Orders This Month",      value: data.ordersThisMonth,                icon: ShoppingBag, color: "amber",  href: "/admin/sales" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Email verification banner */}
      {!authorMeta?.emailVerified && (
        <EmailVerificationBanner email={authorMeta?.email ?? ""} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {(session?.user as any)?.name?.split(" ")[0] ?? "Author"}
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Book
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Sales</h2>
            <Link href="/admin/sales" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No sales yet. Once readers purchase books, they'll appear here.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {order.customerName?.[0] ?? order.customerEmail[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.customerName ?? order.customerEmail}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items[0]?.book?.title ?? "Book purchase"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatCents(order.totalCents)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Books + Plan */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your Books</h2>
              <Link href="/admin/books" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data.books.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm mb-3">No books yet.</p>
                <Link href="/admin/books/new">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add your first book
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.books.map((book) => (
                  <div key={book.id} className="flex items-center gap-3 px-5 py-3">
                    <BookOpen className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{book.title}</p>
                      {!book.isPublished && (
                        <span className="text-xs text-amber-500">Draft</span>
                      )}
                    </div>
                    {book.isFeatured && (
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {formatCents(book.priceCents)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan info */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Current Plan: {data.planName}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {(data.planFeatures as string[]).join(" · ")}
                </p>
              </div>
              <Link href="/admin/settings">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
