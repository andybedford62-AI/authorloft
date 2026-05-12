"use client";

import { useEffect, useState } from "react";
import { Download, DollarSign, ShoppingBag, TrendingUp, Receipt } from "lucide-react";
import { formatCents } from "@/lib/utils";

type OrderItem = { title: string; format: string; cents: number };
type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  discountCents: number;
  items: OrderItem[];
};
type Stats = { totalCents: number; discountCents: number; orderCount: number; avgCents: number };
type Data  = { year: number; availableYears: number[]; stats: Stats; orders: Order[] };

export default function InvoicesPage() {
  const currentYear = new Date().getFullYear();
  const [year,    setYear]    = useState(currentYear);
  const [data,    setData]    = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/invoices?year=${year}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [year]);

  const stats = data?.stats;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices &amp; Tax Summary</h1>
          <p className="text-sm text-gray-500 mt-1">
            Annual income summary and transaction history for your records.
          </p>
        </div>
        <a
          href={`/api/admin/invoices/export?year=${year}`}
          download
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export {year} CSV
        </a>
      </div>

      {/* Year tabs */}
      <div className="flex gap-2 flex-wrap">
        {(data?.availableYears ?? [currentYear]).map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              year === y
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue",   value: stats ? formatCents(stats.totalCents)            : "—", icon: DollarSign,  color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Total Discounts", value: stats ? formatCents(stats.discountCents)          : "—", icon: TrendingUp,  color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Total Orders",    value: stats ? stats.orderCount.toString()               : "—", icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Avg Order Value", value: stats ? formatCents(stats.avgCents)               : "—", icon: Receipt,     color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{loading ? "…" : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Net revenue callout */}
      {stats && stats.discountCents > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800 flex items-center justify-between">
          <span>Net revenue after discounts</span>
          <span className="font-bold text-lg">{formatCents(stats.totalCents - stats.discountCents)}</span>
        </div>
      )}

      {/* Orders table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
          Loading…
        </div>
      ) : !data?.orders.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Receipt className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No completed orders in {year}</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here once readers purchase your books.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {data.orders.length} transaction{data.orders.length !== 1 ? "s" : ""} in {year}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Books</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Discount</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            {item.title}
                            {item.format !== "—" && (
                              <span className="text-gray-400"> · {item.format}</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 hidden sm:table-cell whitespace-nowrap">
                      {order.discountCents > 0 ? `−${formatCents(order.discountCents)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatCents(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    {year} Total
                  </td>
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700 lg:hidden">
                    {year} Total
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500 font-medium hidden sm:table-cell whitespace-nowrap">
                    {stats && stats.discountCents > 0 ? `−${formatCents(stats.discountCents)}` : ""}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                    {stats ? formatCents(stats.totalCents) : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tax note */}
      <p className="text-xs text-gray-400 text-center pb-2">
        This summary is for your records only. Consult a tax professional for filing requirements in your jurisdiction.
        Revenue figures are gross amounts before platform fees and payment processing costs.
      </p>
    </div>
  );
}
