import { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseShippingAddress, shippingLines } from "@/lib/shipping-address";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { ShoppingBag, TrendingUp, DollarSign, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/utils";
import { SalesCharts } from "@/components/admin/sales-charts";
import { OrderShipControl } from "@/components/admin/order-ship-control";

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "danger"> = {
  COMPLETED: "success",
  PENDING: "warning",
  REFUNDED: "default",
  FAILED: "danger",
};

// ?view=orders (default): real orders, i.e. everything except abandoned checkouts
// ?view=abandoned: checkouts started but never paid (status PENDING)
// ?view=all: everything
type SalesView = "orders" | "abandoned" | "all";

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const authorId = await getAdminAuthorId();
  const { view: rawView } = await searchParams;
  const view: SalesView = rawView === "abandoned" || rawView === "all" ? rawView : "orders";
  const statusFilter =
    view === "orders" ? { status: { not: "PENDING" as const } } : view === "abandoned" ? { status: "PENDING" as const } : {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, totalRevenue, ordersThisMonth, totalOrders, revenueThisMonth, toShipCount, abandonedCount] = await Promise.all([
    prisma.order.findMany({
      where: { authorId, ...statusFilter },
      include: {
        items: {
          include: { book: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.order.aggregate({
      where: { authorId, status: "COMPLETED" },
      _sum: { totalCents: true },
    }),
    prisma.order.count({
      where: { authorId, status: "COMPLETED", createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({ where: { authorId, status: "COMPLETED" } }),
    prisma.order.aggregate({
      where: { authorId, status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { totalCents: true },
    }),
    prisma.order.count({
      where: { authorId, status: "COMPLETED", shippingAddress: { not: Prisma.DbNull }, shippedAt: null },
    }),
    prisma.order.count({ where: { authorId, status: "PENDING" } }),
  ]);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCents(totalRevenue._sum.totalCents ?? 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "This Month",
      value: formatCents(revenueThisMonth._sum.totalCents ?? 0),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Orders This Month",
      value: ordersThisMonth.toString(),
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (toShipCount > 0) {
    stats.push({ label: "Print orders to ship", value: toShipCount.toString(), icon: Truck, color: "text-red-600", bg: "bg-red-50" });
  }

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <p className="text-sm text-gray-500 mt-1">Orders and revenue from your digital book sales.</p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 ${stats.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue charts */}
      <SalesCharts />

      {/* View filter: abandoned checkouts are hidden by default so they don't bury real orders */}
      <div className="flex flex-wrap items-center gap-2 text-sm" role="tablist" aria-label="Order view">
        {([
          ["orders", "Orders"],
          ["abandoned", `Abandoned checkouts${abandonedCount > 0 ? ` (${abandonedCount})` : ""}`],
          ["all", "All"],
        ] as [SalesView, string][]).map(([v, label]) => (
          <Link
            key={v}
            href={v === "orders" ? "/admin/sales" : `/admin/sales?view=${v}`}
            role="tab"
            aria-selected={view === v}
            className={`rounded-full border px-4 py-1.5 transition-colors ${
              view === v ? "border-blue-600 bg-blue-50 font-medium text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      {view === "abandoned" && (
        <p className="-mt-3 text-xs text-gray-500">
          Readers who reached checkout but did not finish paying. No money was taken. These are removed automatically after 30 days.
        </p>
      )}

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">{view === "abandoned" ? "No abandoned checkouts" : "No orders yet"}</p>
          <p className="text-sm text-gray-400 mt-1">
            {view === "abandoned"
              ? "Checkouts that were started but not paid will show here."
              : "Orders will appear here once readers purchase your books. Make sure Stripe is connected and your books have prices set."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Books</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{order.customerName || "—"}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    {(() => {
                      const ship = parseShippingAddress(order.shippingAddress);
                      return ship ? (
                        <p className="mt-1 text-xs text-emerald-700">
                          <span className="font-semibold">Ship to:</span>{" "}
                          {shippingLines(ship).join(", ")}
                        </p>
                      ) : null;
                    })()}
                    {order.shippingAddress && order.status === "COMPLETED" && (
                      <OrderShipControl
                        orderId={order.id}
                        shippedAt={order.shippedAt ? order.shippedAt.toISOString() : null}
                        trackingCarrier={order.trackingCarrier}
                        trackingNumber={order.trackingNumber}
                      />
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-xs text-gray-600 line-clamp-1">
                          {item.book?.title ?? "—"}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">{formatCents(order.totalCents)}</span>
                    {order.shippingCents > 0 && (
                      <p className="text-xs text-gray-400">+ {formatCents(order.shippingCents)} shipping</p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {order.createdAt.toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {orders.length === 50 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">Showing most recent 50 orders</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
