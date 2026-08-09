"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCents } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Period = "30" | "90" | "365";

interface StatsData {
  revenueByDay:    { date: string; totalCents: number }[];
  revenueByBook:   { bookTitle: string; totalCents: number }[];
  revenueByFormat: { format: string; totalCents: number }[];
}

function formatDate(iso: string, period: Period) {
  const d = new Date(iso);
  if (period === "365") return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dollarTick(cents: number) {
  return cents === 0 ? "$0" : `$${(cents / 100).toFixed(0)}`;
}

const FORMAT_LABELS: Record<string, string> = {
  EBOOK:    "eBook",
  AUDIO:    "Audio",
  FLIPBOOK: "Flip Book",
  PRINT:    "Print",
  OTHER:    "Other",
};

const FORMAT_COLORS: Record<string, string> = {
  EBOOK:    "bg-blue-500",
  AUDIO:    "bg-purple-500",
  FLIPBOOK: "bg-indigo-500",
  PRINT:    "bg-amber-500",
  OTHER:    "bg-gray-400",
};

export function SalesCharts() {
  const [period, setPeriod]   = useState<Period>("30");
  const [data, setData]       = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/sales/stats?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  // For the area chart, thin out labels so they don't overlap
  const tickInterval = period === "365" ? 29 : period === "90" ? 13 : 5;

  const hasRevenue = data && data.revenueByDay.some((d) => d.totalCents > 0);

  return (
    <div className="space-y-6">
      {/* ── Revenue over time ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Revenue Over Time</h2>
          <div className="flex gap-1">
            {(["30", "90", "365"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {p === "365" ? "12mo" : `${p}d`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : !hasRevenue ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">
            No completed orders in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data!.revenueByDay} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v, period)}
                interval={tickInterval}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={dollarTick}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v) => [formatCents(Number(v ?? 0)), "Revenue"]}
                labelFormatter={(l) => formatDate(l, period)}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
              />
              <Area
                type="monotone"
                dataKey="totalCents"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Revenue by book + format ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* By book — takes 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Revenue by Book</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : !data || data.revenueByBook.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, data.revenueByBook.length * 36)}>
              <BarChart
                data={data.revenueByBook}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={dollarTick}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="bookTitle"
                  tick={{ fontSize: 11, fill: "#374151" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                  tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 17) + "…" : v}
                />
                <Tooltip
                  formatter={(v) => [formatCents(Number(v ?? 0)), "Revenue"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                />
                <Bar dataKey="totalCents" fill="#7C3AED" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By format — takes 1/3 width */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Revenue by Format</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : !data || data.revenueByFormat.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data</div>
          ) : (
            <div className="space-y-3 mt-2">
              {data.revenueByFormat.map(({ format, totalCents }) => {
                const total = data.revenueByFormat.reduce((s, r) => s + r.totalCents, 0);
                const pct   = total > 0 ? Math.round((totalCents / total) * 100) : 0;
                return (
                  <div key={format}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">
                        {FORMAT_LABELS[format] ?? format}
                      </span>
                      <span className="text-gray-500">{formatCents(totalCents)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${FORMAT_COLORS[format] ?? "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
