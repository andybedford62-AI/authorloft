"use client";

import { useState, useEffect, useCallback } from "react";
import { PartyPopper, Plus, Pencil, Copy, Trash2, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type StripeCoupon = {
  id: string;
  name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  duration: string;
  duration_in_months: number | null;
};

type EarlyBirdOffer = {
  id: string;
  name: string;
  enabled: boolean;
  percentOff: number;
  durationMonths: number;
  windowDays: number;
  couponIdMonthly: string | null;
  couponIdAnnual: string | null;
  headline: string | null;
  subtext: string | null;
};

type FormState = {
  id: string | null; // null = creating a new offer
  name: string;
  enabled: boolean;
  percentOff: string;
  durationMonths: string;
  windowDays: string;
  couponIdMonthly: string;
  couponIdAnnual: string;
  headline: string;
  subtext: string;
};

const input = "w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500";
const label = "block text-xs font-medium text-gray-600 mb-1.5";

const BLANK_FORM: FormState = {
  id: null, name: "", enabled: false,
  percentOff: "20", durationMonths: "3", windowDays: "30",
  couponIdMonthly: "", couponIdAnnual: "", headline: "", subtext: "",
};

function formatCoupon(c: StripeCoupon) {
  const discount = c.percent_off ? `${c.percent_off}% off` : c.amount_off ? `$${(c.amount_off / 100).toFixed(2)} off` : "—";
  return `${c.name ?? c.id} (${discount})`;
}

function couponLabel(coupons: StripeCoupon[], id: string | null, envVarName: string) {
  if (!id) return `env var (${envVarName})`;
  const c = coupons.find(c => c.id === id);
  return c ? formatCoupon(c) : id;
}

export function FoundingOfferPanel({ coupons }: { coupons: StripeCoupon[] }) {
  const [offers, setOffers]   = useState<EarlyBirdOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<FormState | null>(null); // null = form closed
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/super-admin/early-bird");
    const data = await res.json();
    setOffers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => f ? { ...f, [key]: val } : f);
  }

  function openCreate() {
    setError("");
    setForm({ ...BLANK_FORM });
  }

  function openEdit(offer: EarlyBirdOffer) {
    setError("");
    setForm({
      id: offer.id,
      name: offer.name,
      enabled: offer.enabled,
      percentOff: String(offer.percentOff),
      durationMonths: String(offer.durationMonths),
      windowDays: String(offer.windowDays),
      couponIdMonthly: offer.couponIdMonthly ?? "",
      couponIdAnnual: offer.couponIdAnnual ?? "",
      headline: offer.headline ?? "",
      subtext: offer.subtext ?? "",
    });
  }

  // "Reuse" — start a new offer pre-filled from an existing one, so terms
  // don't need to be retyped. Always opens as a new (not-yet-enabled) offer.
  function openDuplicate(offer: EarlyBirdOffer) {
    setError("");
    setForm({
      id: null,
      name: `${offer.name} (copy)`,
      enabled: false,
      percentOff: String(offer.percentOff),
      durationMonths: String(offer.durationMonths),
      windowDays: String(offer.windowDays),
      couponIdMonthly: offer.couponIdMonthly ?? "",
      couponIdAnnual: offer.couponIdAnnual ?? "",
      headline: offer.headline ?? "",
      subtext: offer.subtext ?? "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");

    const body = {
      name:            form.name,
      enabled:         form.enabled,
      percentOff:      form.percentOff,
      durationMonths:  form.durationMonths,
      windowDays:      form.windowDays,
      couponIdMonthly: form.couponIdMonthly || null,
      couponIdAnnual:  form.couponIdAnnual || null,
      headline:        form.headline || null,
      subtext:         form.subtext || null,
    };

    const res = await fetch(
      form.id ? `/api/super-admin/early-bird/${form.id}` : "/api/super-admin/early-bird",
      {
        method:  form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); setSaving(false); return; }

    setForm(null);
    await load();
    setSaving(false);
  }

  async function handleToggle(offer: EarlyBirdOffer) {
    await fetch(`/api/super-admin/early-bird/${offer.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ enabled: !offer.enabled }),
    });
    await load();
  }

  async function handleDelete(offer: EarlyBirdOffer) {
    const warning = offer.enabled
      ? `"${offer.name}" is currently the ACTIVE offer — deleting it turns off the dashboard banner. Delete anyway?`
      : `Delete "${offer.name}"? This can't be undone.`;
    if (!confirm(warning)) return;
    setDeleting(offer.id);
    await fetch(`/api/super-admin/early-bird/${offer.id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  // Preview text — custom headline/subtext override, else generated from terms.
  const previewHeadline = form?.headline?.trim()
    || `Founding member offer — ${form?.percentOff || 0}% off for your first ${form?.durationMonths || 0} month${form?.durationMonths === "1" ? "" : "s"}`;
  const previewSubtext = form?.subtext?.trim()
    || `Upgrade within ${form?.windowDays || 0} day${form?.windowDays === "1" ? "" : "s"} to lock in your discount. Auto-applied at checkout.`;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <PartyPopper className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Founding Member Offers</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Save as many offer presets as you want — Black Friday, a launch offer, a holiday special.
              Only one is ever live on the dashboard banner at a time. Turn one on, edit it in place, or
              reuse an old one as a starting point — no code changes or redeploys.
            </p>
          </div>
        </div>
        {!form && (
          <Button type="button" size="sm" onClick={openCreate} className="flex-shrink-0 whitespace-nowrap">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Offer
          </Button>
        )}
      </div>

      {/* Saved offers list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading offers…
        </div>
      ) : offers.length === 0 && !form ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No offers saved yet. Create one to show the founding-member banner.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {offers.map(offer => (
            <div key={offer.id} className="rounded-lg bg-white border border-amber-100 px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm truncate">{offer.name}</p>
                  {offer.enabled && (
                    <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {offer.percentOff}% off · {offer.durationMonths} mo · {offer.windowDays}-day window
                  {" · "}monthly: {couponLabel(coupons, offer.couponIdMonthly, "STRIPE_EARLY_BIRD_COUPON_MONTHLY")}
                  {" · "}annual: {couponLabel(coupons, offer.couponIdAnnual, "STRIPE_EARLY_BIRD_COUPON_ANNUAL")}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  role="switch"
                  aria-checked={offer.enabled}
                  onClick={() => handleToggle(offer)}
                  title={offer.enabled ? "Turn off" : "Make this the live offer"}
                  className={`relative w-10 h-6 rounded-full cursor-pointer transition-colors ${offer.enabled ? "bg-amber-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${offer.enabled ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <button type="button" onClick={() => openEdit(offer)} title="Edit" className="text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => openDuplicate(offer)} title="Reuse as a new offer" className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(offer)} disabled={deleting === offer.id} title="Delete" className="text-gray-400 hover:text-red-500 disabled:opacity-50">
                  {deleting === offer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit form */}
      {form && (
        <form onSubmit={handleSave} className="rounded-lg bg-white border border-amber-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">{form.id ? "Edit Offer" : "New Offer"}</h3>
            <button type="button" onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className={label}>Offer name (internal only — not shown to authors)</label>
            <input required value={form.name} onChange={e => setField("name", e.target.value)}
              placeholder="e.g. Black Friday 2026" className={input} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label}>Percent off</label>
              <input type="number" min={1} max={100} required value={form.percentOff}
                onChange={e => setField("percentOff", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Duration (months)</label>
              <input type="number" min={1} required value={form.durationMonths}
                onChange={e => setField("durationMonths", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Eligibility window (days since signup)</label>
              <input type="number" min={1} required value={form.windowDays}
                onChange={e => setField("windowDays", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Coupon applied — Monthly plans</label>
              <select value={form.couponIdMonthly} onChange={e => setField("couponIdMonthly", e.target.value)} className={input}>
                <option value="">— use STRIPE_EARLY_BIRD_COUPON_MONTHLY env var —</option>
                {coupons.map(c => <option key={c.id} value={c.id}>{formatCoupon(c)}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Coupon applied — Annual plans</label>
              <select value={form.couponIdAnnual} onChange={e => setField("couponIdAnnual", e.target.value)} className={input}>
                <option value="">— use STRIPE_EARLY_BIRD_COUPON_ANNUAL env var —</option>
                {coupons.map(c => <option key={c.id} value={c.id}>{formatCoupon(c)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Custom banner wording (optional — auto-generated from the terms above if left blank)
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={label}>Headline override</label>
                <input value={form.headline} onChange={e => setField("headline", e.target.value)}
                  placeholder={previewHeadline} className={input} />
              </div>
              <div>
                <label className={label}>Subtext override</label>
                <input value={form.subtext} onChange={e => setField("subtext", e.target.value)}
                  placeholder={previewSubtext} className={input} />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Dashboard preview</p>
            <p className="text-sm font-semibold text-amber-900">{previewHeadline}</p>
            <p className="text-xs text-amber-700 mt-0.5">{previewSubtext}</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={form.enabled} onChange={e => setField("enabled", e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            Make this the live offer now {form.enabled && "(replaces whichever offer is currently active)"}
          </label>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : (form.id ? "Save Changes" : "Create Offer")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
