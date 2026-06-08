"use client";

import { Download, Mail } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  isConfirmed: boolean;
  createdAt: string;
};

function toCsv(rows: Subscriber[]): string {
  const header = ["Email", "Name", "Source", "Confirmed", "Subscribed At"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      esc(r.email),
      esc(r.name ?? ""),
      esc(r.source ?? ""),
      r.isConfirmed ? "yes" : "no",
      esc(new Date(r.createdAt).toISOString()),
    ].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function SubscribersClient({ subscribers }: { subscribers: Subscriber[] }) {
  function exportCsv() {
    const csv = toCsv(subscribers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `authorloft-news-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{subscribers.length.toLocaleString()}</span> subscriber{subscribers.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-sm">No subscribers yet. They&apos;ll appear here as people sign up on the News page, footer, or homepage.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 text-sm text-gray-900">{s.email}</td>
                  <td className="py-2.5 px-3 text-sm text-gray-500">{s.name || "—"}</td>
                  <td className="py-2.5 px-3 text-sm text-gray-500 capitalize">{s.source || "—"}</td>
                  <td className="py-2.5 px-3 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
