"use client";

import { useEffect, useState } from "react";
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight,
  Loader2, Copy, Check,
} from "lucide-react";
import { formatCents } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type DiscountCode = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  bookId: string | null;
  book: { id: string; title: string } | null;
  createdAt: string;
};

type BookOption = { id: string; title: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatValue(code: DiscountCode) {
  return code.type === "PERCENT"
    ? `${code.value}% off`
    : `${formatCents(code.value)} off`;
}

function usageLabel(code: DiscountCode) {
  if (code.maxUses === null) return `${code.usesCount} uses (unlimited)`;
  return `${code.usesCount} / ${code.maxUses} uses`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DiscountCodesPage() {
  const [codes,     setCodes]     = useState<DiscountCode[]>([]);
  const [books,     setBooks]     = useState<BookOption[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [copied,    setCopied]    = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    code:        "",
    description: "",
    type:        "PERCENT" as "PERCENT" | "FIXED",
    value:       "",
    maxUses:     "",
    expiresAt:   "",
    bookId:      "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/discount-codes").then((r) => r.json()),
      fetch("/api/admin/books").then((r) => r.json()),
    ]).then(([codesData, booksData]) => {
      setCodes(Array.isArray(codesData) ? codesData : []);
      setBooks(
        Array.isArray(booksData)
          ? booksData.map((b: any) => ({ id: b.id, title: b.title }))
          : []
      );
    }).finally(() => setLoading(false));
  }, []);

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code:        form.code,
          description: form.description || undefined,
          type:        form.type,
          value:       form.type === "PERCENT"
                         ? Number(form.value)
                         : Math.round(Number(form.value) * 100), // dollars → cents
          maxUses:     form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt:   form.expiresAt || undefined,
          bookId:      form.bookId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not create code."); return; }
      setCodes((prev) => [data, ...prev]);
      setForm({ code: "", description: "", type: "PERCENT", value: "", maxUses: "", expiresAt: "", bookId: "" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(code: DiscountCode) {
    setTogglingId(code.id);
    try {
      const res = await fetch(`/api/admin/discount-codes/${code.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !code.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteCode(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, { method: "DELETE" });
      if (res.ok) setCodes((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create codes your readers can enter at checkout to get a discount.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">New Discount Code</h2>
        <form onSubmit={createCode} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Code <span className="text-red-500">*</span></label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                placeholder="e.g. LAUNCH20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Internal note <span className="text-gray-400">(optional)</span></label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Newsletter launch promo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Discount type <span className="text-red-500">*</span></label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENT">Percentage (e.g. 20%)</option>
                <option value="FIXED">Fixed amount (e.g. $5.00)</option>
              </select>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                {form.type === "PERCENT" ? "Percent off (1–100)" : "Amount off (dollars)"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {form.type === "FIXED" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                )}
                <input
                  required
                  type="number"
                  min={1}
                  max={form.type === "PERCENT" ? 100 : undefined}
                  step={form.type === "FIXED" ? "0.01" : "1"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === "PERCENT" ? "20" : "5.00"}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${form.type === "FIXED" ? "pl-6" : ""}`}
                />
                {form.type === "PERCENT" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                )}
              </div>
            </div>

            {/* Max uses */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Usage limit <span className="text-gray-400">(optional — blank = unlimited)</span></label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="e.g. 100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expiry */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Expiry date <span className="text-gray-400">(optional)</span></label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Book restriction */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-gray-700">Restrict to book <span className="text-gray-400">(optional — blank = all books)</span></label>
              <select
                value={form.bookId}
                onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All books</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Code
            </button>
          </div>
        </form>
      </div>

      {/* Code list */}
      {codes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Tag className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No discount codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Code</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Discount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Usage</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Expires</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Book</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map((code) => (
                <tr key={code.id} className={`hover:bg-gray-50 transition-colors ${!code.isActive ? "opacity-50" : ""}`}>
                  {/* Code + description */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 text-sm">{code.code}</span>
                      <button
                        onClick={() => copyCode(code.code)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        title="Copy code"
                      >
                        {copied === code.code
                          ? <Check className="h-3.5 w-3.5 text-green-500" />
                          : <Copy className="h-3.5 w-3.5" />
                        }
                      </button>
                    </div>
                    {code.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{code.description}</p>
                    )}
                    {!code.isActive && (
                      <span className="text-xs text-gray-400 italic">Inactive</span>
                    )}
                  </td>

                  {/* Discount value */}
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm font-semibold text-gray-800">{formatValue(code)}</span>
                  </td>

                  {/* Usage */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{usageLabel(code)}</span>
                  </td>

                  {/* Expiry */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {code.expiresAt
                        ? new Date(code.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "No expiry"}
                    </span>
                  </td>

                  {/* Book restriction */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {code.book ? code.book.title : "All books"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle active */}
                      <button
                        onClick={() => toggleActive(code)}
                        disabled={!!togglingId}
                        title={code.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-40"
                      >
                        {togglingId === code.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : code.isActive
                            ? <ToggleRight className="h-4 w-4 text-green-500" />
                            : <ToggleLeft className="h-4 w-4" />
                        }
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteCode(code.id)}
                        disabled={!!deletingId}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                      >
                        {deletingId === code.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
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
