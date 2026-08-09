"use client";

import { useEffect, useState } from "react";
import { Loader2, Link2, Copy, Check, Trash2, Percent, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";

type Referral = {
  id: string;
  refCode: string;
  label: string | null;
  clicks: number;
  saleCount: number;
  earningsCents: number;
};

type Props = {
  bookId: string;
  bookSlug: string;
  publicBaseUrl: string;
  salesEnabled: boolean;
};

export function AffiliateSettings({ bookId, bookSlug, publicBaseUrl, salesEnabled }: Props) {
  const [loading, setLoading]         = useState(true);
  const [enabled, setEnabled]         = useState(false);
  const [commission, setCommission]   = useState(10);
  const [referrals, setReferrals]     = useState<Referral[]>([]);
  const [saving, setSaving]           = useState(false);
  const [newLabel, setNewLabel]       = useState("");
  const [creating, setCreating]       = useState(false);
  const [error, setError]             = useState("");
  const [copiedId, setCopiedId]       = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/books/${bookId}/affiliate`);
    if (res.ok) {
      const data = await res.json();
      setEnabled(data.affiliateEnabled);
      setCommission(data.affiliateCommissionPercent);
      setReferrals(data.affiliateReferrals ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveSettings(next: { affiliateEnabled?: boolean; affiliateCommissionPercent?: number }) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/books/${bookId}/affiliate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save.");
    }
    setSaving(false);
  }

  function toggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    saveSettings({ affiliateEnabled: next });
  }

  function handleCommissionBlur() {
    saveSettings({ affiliateCommissionPercent: commission });
  }

  async function createReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch(`/api/admin/books/${bookId}/affiliate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to create link.");
    } else {
      setReferrals((prev) => [data, ...prev]);
      setNewLabel("");
    }
    setCreating(false);
  }

  async function deleteReferral(id: string) {
    if (!confirm("Delete this referral link? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/books/${bookId}/affiliate?referralId=${id}`, { method: "DELETE" });
    if (res.ok) setReferrals((prev) => prev.filter((r) => r.id !== id));
  }

  function copyLink(referral: Referral) {
    const url = `${publicBaseUrl}/books/${bookSlug}?ref=${encodeURIComponent(referral.refCode)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(referral.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  if (!salesEnabled) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 text-sm text-amber-800">
        <span className="font-semibold">Affiliate links require Direct Sales to be enabled</span> on this book first (Direct Sales tab).
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading affiliate settings…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Affiliate / Referral Program
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Let readers and promoters earn a commission for sales they refer. Generate unique
            links below — anyone who buys through one gives you both credit for the sale.
          </p>
        </div>

        <div className="flex items-center gap-4 cursor-pointer select-none" onClick={toggleEnabled}>
          <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-gray-300"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Enable affiliate links for this book</p>
            <p className="text-xs text-gray-400">{enabled ? "Referral links below are active." : "Referral links are inactive until enabled."}</p>
          </div>
        </div>

        {enabled && (
          <div className="ml-14 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Commission</label>
            <div className="relative w-24">
              <input
                type="number"
                min={1}
                max={50}
                value={commission}
                onChange={(e) => setCommission(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                onBlur={handleCommissionBlur}
                className="block w-full rounded-md border border-gray-300 bg-white pl-3 pr-7 py-1.5 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <Percent className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-gray-400">of the sale price, per referred order</span>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </section>

      {enabled && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Referral Links</h2>

          <form onSubmit={createReferral} className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Jane's Book Club, Newsletter, Instagram"
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Button type="submit" size="sm" disabled={creating || !newLabel.trim()}>
              {creating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5 mr-1.5" />}
              Generate Link
            </Button>
          </form>

          {referrals.length === 0 ? (
            <p className="text-sm text-gray-400">No referral links yet. Generate one above to start tracking.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-2 py-2 font-medium">Label</th>
                    <th className="px-2 py-2 font-medium">Link</th>
                    <th className="px-2 py-2 font-medium text-right">Clicks</th>
                    <th className="px-2 py-2 font-medium text-right">Sales</th>
                    <th className="px-2 py-2 font-medium text-right">Earned</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td className="px-2 py-2 text-gray-700">{r.label || r.refCode}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => copyLink(r)}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors font-mono"
                        >
                          {copiedId === r.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          ?ref={r.refCode}
                        </button>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-500">{r.clicks}</td>
                      <td className="px-2 py-2 text-right text-gray-500">{r.saleCount}</td>
                      <td className="px-2 py-2 text-right font-medium text-emerald-700">${(r.earningsCents / 100).toFixed(2)}</td>
                      <td className="px-2 py-2 text-right">
                        <IconButton
                          icon={<Trash2 className="h-4 w-4" />}
                          title="Delete link"
                          variant="delete"
                          onClick={() => deleteReferral(r.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
