"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, X, Eye, Clipboard, Loader2, CircleCheck, CircleX, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type LogRow = {
  id: string;
  authorId: string;
  author:    { id: string; name: string; displayName: string | null; email: string; slug: string };
  platformId:  string;
  platform:    { id: string; slug: string; name: string };
  promoTypeId: string;
  promoType:   { id: string; slug: string; name: string };
  contextType:    string;
  contextRefId:   string | null;
  contextSummary: string | null;
  promptUsed:    string;
  outputText:    string;
  modelUsed:     string;
  inputTokens:   number;
  outputTokens:  number;
  costMicroCents: number;
  status:       string;
  errorMessage: string | null;
  wasCopied:    boolean;
  copiedAt:     string | null;
  ipAddress:    string | null;
  createdAt:    string;
};

type Option = { id: string; slug: string; name: string };

function statusPill(status: string) {
  switch (status) {
    case "SUCCESS": return { Icon: CircleCheck, cls: "bg-green-50 text-green-700 border-green-100" };
    case "FAILED":  return { Icon: CircleX,     cls: "bg-red-50 text-red-700 border-red-100" };
    case "BLOCKED": return { Icon: ShieldAlert, cls: "bg-amber-50 text-amber-700 border-amber-100" };
    default:        return { Icon: FileText,    cls: "bg-gray-50 text-gray-700 border-gray-100" };
  }
}

export function SocialPromoteLogPanel({
  initialRows, initialTotal, pageSize, platforms, promoTypes,
}: {
  initialRows: LogRow[];
  initialTotal: number;
  pageSize: number;
  platforms: Option[];
  promoTypes: Option[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<LogRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<LogRow | null>(null);

  const [status, setStatus] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [promoTypeId, setPromoTypeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function fetchPage(targetPage: number) {
    setLoading(true);
    const params = new URLSearchParams();
    if (status)      params.set("status", status);
    if (platformId)  params.set("platformId", platformId);
    if (promoTypeId) params.set("promoTypeId", promoTypeId);
    if (from)        params.set("from", new Date(from).toISOString());
    if (to)          params.set("to",   new Date(to).toISOString());
    params.set("page", targetPage.toString());
    const res = await fetch(`/api/super-admin/social-promote/log?${params.toString()}`);
    if (res.ok) {
      const body = await res.json();
      setRows(body.rows);
      setTotal(body.total);
      setPage(body.page);
    }
    setLoading(false);
  }

  function applyFilters() {
    fetchPage(1);
  }

  function clearFilters() {
    setStatus("");
    setPlatformId("");
    setPromoTypeId("");
    setFrom("");
    setTo("");
    fetchPage(1);
    router.refresh();
  }

  const hasActiveFilter = !!(status || platformId || promoTypeId || from || to);

  return (
    <>
      {preview && <PreviewDrawer row={preview} onClose={() => setPreview(null)} />}

      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <select value={platformId} onChange={(e) => setPlatformId(e.target.value)} className={selectCls}>
            <option value="">All platforms</option>
            {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={promoTypeId} onChange={(e) => setPromoTypeId(e.target.value)} className={selectCls}>
            <option value="">All promo types</option>
            {promoTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls} placeholder="From" />
          <input type="date" value={to}   onChange={(e) => setTo(e.target.value)}   className={selectCls} placeholder="To" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={applyFilters} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading…</> : <><Filter className="h-4 w-4 mr-2" />Apply filters</>}
            </Button>
            {hasActiveFilter && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />Clear
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {total.toLocaleString()} generation{total === 1 ? "" : "s"}
            {hasActiveFilter && " (filtered)"}
          </p>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {hasActiveFilter ? "No generations match these filters." : "No generations yet. Author UI ships in an upcoming session."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thCls}>When</th>
                  <th className={thCls}>Author</th>
                  <th className={thCls}>Promo / Platform</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Copied?</th>
                  <th className={thCls}>Tokens</th>
                  <th className={thCls}>Cost</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row) => {
                  const { Icon, cls } = statusPill(row.status);
                  const costCents = row.costMicroCents / 10000;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className={tdCls + " text-gray-500 whitespace-nowrap"}>
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className={tdCls}>
                        <div className="font-medium text-gray-900">{row.author.displayName ?? row.author.name}</div>
                        <div className="text-xs text-gray-400">{row.author.email}</div>
                      </td>
                      <td className={tdCls}>
                        <div className="text-gray-900">{row.promoType.name}</div>
                        <div className="text-xs text-gray-400">{row.platform.name}</div>
                      </td>
                      <td className={tdCls}>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
                          <Icon className="h-3 w-3" />
                          {row.status}
                        </span>
                      </td>
                      <td className={tdCls}>
                        {row.wasCopied ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <Clipboard className="h-3 w-3" />Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </td>
                      <td className={tdCls + " text-gray-700 text-xs whitespace-nowrap"}>
                        {row.inputTokens}↑ / {row.outputTokens}↓
                      </td>
                      <td className={tdCls + " text-gray-700 text-xs whitespace-nowrap"}>
                        ${(costCents / 100).toFixed(5)}
                      </td>
                      <td className={tdCls + " text-right"}>
                        <button
                          onClick={() => setPreview(row)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" disabled={page <= 1 || loading} onClick={() => fetchPage(page - 1)}>
              ← Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="ghost" disabled={page >= totalPages || loading} onClick={() => fetchPage(page + 1)}>
              Next →
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function PreviewDrawer({ row, onClose }: { row: LogRow; onClose: () => void }) {
  const costCents = row.costMicroCents / 10000;
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Generation preview</h3>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(row.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm">
          <Section title="Author">
            <div className="text-gray-900 font-medium">{row.author.displayName ?? row.author.name}</div>
            <div className="text-xs text-gray-400">{row.author.email} · /{row.author.slug}</div>
          </Section>

          <Section title="Promo type & platform">
            <div className="text-gray-900">{row.promoType.name} → {row.platform.name}</div>
            <div className="text-xs text-gray-400">Context: {row.contextType}{row.contextRefId ? ` (${row.contextRefId})` : ""}</div>
            {row.contextSummary && (
              <div className="text-xs text-gray-500 mt-1 italic">"{row.contextSummary}"</div>
            )}
          </Section>

          <Section title="Output">
            <pre className="whitespace-pre-wrap text-gray-900 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
              {row.outputText || <span className="text-gray-400">(empty)</span>}
            </pre>
          </Section>

          <Section title="Prompt (as sent to the model)">
            <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono leading-relaxed max-h-72 overflow-y-auto">
              {row.promptUsed}
            </pre>
          </Section>

          {row.errorMessage && (
            <Section title="Error">
              <pre className="whitespace-pre-wrap text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-xs">
                {row.errorMessage}
              </pre>
            </Section>
          )}

          <Section title="Metadata">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900">{row.status}</dd>
              <dt className="text-gray-500">Model</dt>
              <dd className="text-gray-900 font-mono">{row.modelUsed}</dd>
              <dt className="text-gray-500">Tokens (in/out)</dt>
              <dd className="text-gray-900">{row.inputTokens} / {row.outputTokens}</dd>
              <dt className="text-gray-500">Cost</dt>
              <dd className="text-gray-900">${(costCents / 100).toFixed(6)}</dd>
              <dt className="text-gray-500">Copied?</dt>
              <dd className="text-gray-900">{row.wasCopied ? `Yes (${row.copiedAt ? new Date(row.copiedAt).toLocaleString() : "—"})` : "No"}</dd>
              <dt className="text-gray-500">IP</dt>
              <dd className="text-gray-900 font-mono">{row.ipAddress ?? "—"}</dd>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
const thCls = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider";
const tdCls = "px-4 py-3 text-sm";
