"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { BarChart2, Globe, TrendingUp, Eye } from "lucide-react";

type AnalyticsData = {
  totalViews: number;
  trend:      { date: string; views: number }[];
  topPages:   { path: string; views: number }[];
  referrers:  { source: string; views: number }[];
  geography:  { country: string; views: number }[];
};

function StatCard({
  label, value, icon: Icon, color, bg, loading,
}: {
  label: string; value: string; icon: React.ElementType;
  color: string; bg: string; loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900 truncate">{loading ? "…" : value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function SimpleTable({
  rows, colA, colB, loading,
}: {
  rows: { a: string; b: string }[];
  colA: string; colB: string;
  loading: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{colA}</th>
          <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">{colB}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {loading ? (
          <tr><td colSpan={2} className="px-5 py-8 text-center text-gray-400 text-sm">Loading…</td></tr>
        ) : rows.length === 0 ? (
          <tr><td colSpan={2} className="px-5 py-8 text-center text-gray-400 text-sm">No data for this period</td></tr>
        ) : (
          rows.map((row) => (
            <tr key={row.a} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-2.5 text-gray-700 font-mono text-xs truncate max-w-[240px]">{row.a}</td>
              <td className="px-5 py-2.5 text-right text-gray-500 font-medium whitespace-nowrap">{row.b}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default function AnalyticsPage() {
  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  const topReferrer = data?.referrers.find((r) => r.source !== "Direct")?.source ?? data?.referrers[0]?.source ?? "—";
  const topCountry  = data?.geography[0]?.country ?? "—";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Page views and visitor data for your author site.</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error === "Analytics not configured"
            ? "Analytics is not yet configured. Add POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID to your environment variables."
            : `Failed to load analytics: ${error}`}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views"  value={data?.totalViews.toLocaleString() ?? "—"} icon={Eye}       color="text-blue-600"   bg="bg-blue-50"   loading={loading} />
        <StatCard label="Top Referrer" value={topReferrer}                               icon={TrendingUp} color="text-green-600"  bg="bg-green-50"  loading={loading} />
        <StatCard label="Top Country"  value={topCountry}                                icon={Globe}      color="text-purple-600" bg="bg-purple-50" loading={loading} />
        <StatCard label="Period"       value={`${days} days`}                            icon={BarChart2}  color="text-amber-600"  bg="bg-amber-50"  loading={false}   />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Page Views Over Time</h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
        ) : !data?.trend.length ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No page view data for this period. Make sure your author site has visitors and PostHog is configured.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.trend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(d) => String(d).slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [(Number(v) || 0).toLocaleString(), "Views"]}
                labelFormatter={(l) => `Date: ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row: top pages + right column (referrers + geography) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Top Pages</h2>
          </div>
          <SimpleTable
            loading={loading}
            colA="Page" colB="Views"
            rows={(data?.topPages ?? []).map((r) => ({ a: r.path, b: r.views.toLocaleString() }))}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Traffic Sources</h2>
            </div>
            <SimpleTable
              loading={loading}
              colA="Source" colB="Views"
              rows={(data?.referrers ?? []).map((r) => ({ a: r.source, b: r.views.toLocaleString() }))}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Geography</h2>
            </div>
            <SimpleTable
              loading={loading}
              colA="Country" colB="Views"
              rows={(data?.geography ?? []).map((r) => ({ a: r.country, b: r.views.toLocaleString() }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
