"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Check, Loader2, Tag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoundingOfferPanel } from "./founding-offer-panel";

type StripeCoupon = {
  id: string;
  name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: string;
  duration_in_months: number | null;
  max_redemptions: number | null;
  times_redeemed: number;
  valid: boolean;
  created: number;
};

const input   = "w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";
const label   = "block text-xs font-medium text-gray-600 mb-1.5";

function formatDiscount(c: StripeCoupon) {
  if (c.percent_off) return `${c.percent_off}% off`;
  if (c.amount_off)  return `$${(c.amount_off / 100).toFixed(2)} off`;
  return "—";
}

function formatDuration(c: StripeCoupon) {
  if (c.duration === "once")      return "Once";
  if (c.duration === "forever")   return "Forever";
  if (c.duration === "repeating") return `${c.duration_in_months} month${c.duration_in_months === 1 ? "" : "s"}`;
  return c.duration;
}

export function CouponsClient() {
  const [coupons, setCoupons]     = useState<StripeCoupon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const [error, setError]         = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "", discountType: "percent", discountValue: "",
    duration: "once", durationMonths: "3", maxRedemptions: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/super-admin/coupons");
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const res  = await fetch("/api/super-admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error ?? "Failed to create."); setSaving(false); return; }
    setShowForm(false);
    setForm({ name: "", discountType: "percent", discountValue: "", duration: "once", durationMonths: "3", maxRedemptions: "" });
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string, name: string | null) {
    if (!confirm(`Archive coupon "${name ?? id}"? It can no longer be redeemed.`)) return;
    setDeleting(id);
    await fetch(`/api/super-admin/coupons/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  function handleCopy(id: string) {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header — intentionally has no buttons of its own; every action lives
          inside the section it acts on, so it's never ambiguous which list it hits. */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Coupons &amp; Offers</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Two separate things live on this page: the founding-member offer shown on the dashboard, and
          the general-purpose Stripe coupons you can assign to individual authors or use as an offer's discount.
        </p>
      </div>

      {/* SECTION 1 — Founding member / early bird offers */}
      <FoundingOfferPanel coupons={coupons} />

      {/* SECTION 2 — Raw Stripe coupons */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Stripe Coupons</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                General-purpose discount codes. Assign one to an individual author from their profile page,
                or pick one above as a Founding Member Offer's monthly/annual coupon.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={load} title="Refresh" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
              <RefreshCw className="h-4 w-4" />
            </button>
            <Button size="sm" onClick={() => setShowForm(v => !v)} className="whitespace-nowrap">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Coupon
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreate} className="rounded-xl border border-purple-200 bg-purple-50 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">New Coupon</h3>
              {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={label}>Coupon Name *</label>
                  <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. VIP 30% off" className={input} />
                  <p className="text-xs text-gray-400 mt-1">Shown on the customer's receipt in Stripe.</p>
                </div>
                <div>
                  <label className={label}>Discount Type *</label>
                  <select value={form.discountType} onChange={e => set("discountType", e.target.value)} className={input}>
                    <option value="percent">Percentage off</option>
                    <option value="amount">Fixed amount off (USD)</option>
                  </select>
                </div>
                <div>
                  <label className={label}>{form.discountType === "percent" ? "Percentage (e.g. 20)" : "Amount in dollars (e.g. 10)"} *</label>
                  <input required type="number" min={0} step={form.discountType === "percent" ? "1" : "0.01"}
                    value={form.discountValue} onChange={e => set("discountValue", e.target.value)}
                    placeholder={form.discountType === "percent" ? "20" : "10.00"} className={input} />
                </div>
                <div>
                  <label className={label}>Duration *</label>
                  <select value={form.duration} onChange={e => set("duration", e.target.value)} className={input}>
                    <option value="once">Once (first payment only)</option>
                    <option value="repeating">Repeating (N months)</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
                {form.duration === "repeating" && (
                  <div>
                    <label className={label}>Number of Months</label>
                    <input type="number" min={1} value={form.durationMonths} onChange={e => set("durationMonths", e.target.value)} className={input} />
                  </div>
                )}
                <div>
                  <label className={label}>Max Redemptions (leave blank for unlimited)</label>
                  <input type="number" min={1} value={form.maxRedemptions} onChange={e => set("maxRedemptions", e.target.value)} placeholder="Unlimited" className={input} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><Plus className="h-4 w-4 mr-2" />Create Coupon</>}
                </Button>
              </div>
            </form>
          )}

          {/* Coupons table */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading coupons…
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No coupons yet. Create one above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coupon ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Redemptions</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">{c.id}</code>
                          <button onClick={() => handleCopy(c.id)} className="text-gray-400 hover:text-gray-600">
                            {copied === c.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatDiscount(c)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDuration(c)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.valid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {c.valid ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deleting === c.id}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                          title="Archive coupon"
                        >
                          {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
