"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlanFormData = {
  name: string; slug: string; description: string;
  monthlyPrice: string; annualPrice: string;   // dollars, e.g. "29.00"
  stripePriceIdMonthly: string; stripePriceIdAnnual: string;
  maxBooks: string; maxPosts: string; maxStorageMb: string;
  customDomain: boolean; salesEnabled: boolean;
  flipBooksLimit: string;  // "0" | "3" | "-1" | any number as string
  audioEnabled: boolean; newsletter: boolean; analyticsEnabled: boolean;
  badgeColor: string; featuredLabel: string; sortOrder: number;
  isActive: boolean; isDefault: boolean;
};

type Plan = {
  id: string; name: string; slug: string; description: string | null;
  monthlyPriceCents: number; annualPriceCents: number;
  stripePriceIdMonthly: string | null; stripePriceIdAnnual: string | null;
  maxBooks: number | null; maxPosts: number | null; maxStorageMb: number | null;
  customDomain: boolean; salesEnabled: boolean;
  flipBooksLimit: number;
  audioEnabled: boolean; newsletter: boolean; analyticsEnabled: boolean;
  badgeColor: string; featuredLabel: string | null; sortOrder: number;
  isActive: boolean; isDefault: boolean;
};

const BADGE_OPTIONS = [
  { value: "gray",   label: "Gray",   cls: "bg-gray-700 text-gray-300" },
  { value: "blue",   label: "Blue",   cls: "bg-blue-900 text-blue-300" },
  { value: "purple", label: "Purple", cls: "bg-purple-900 text-purple-300" },
  { value: "gold",   label: "Gold",   cls: "bg-yellow-900 text-yellow-300" },
];

const FLIP_BOOK_PRESETS = [
  { value: "0",  label: "None",      desc: "Free — no flip books" },
  { value: "3",  label: "Up to 3",   desc: "Standard" },
  { value: "-1", label: "Unlimited", desc: "Premium" },
];

export function PlanForm({ plan }: { plan?: Plan }) {
  const router = useRouter();
  const isEditing = !!plan;

  const [form, setForm] = useState<PlanFormData>({
    name: plan?.name ?? "",
    slug: plan?.slug ?? "",
    description: plan?.description ?? "",
    monthlyPrice: plan ? (plan.monthlyPriceCents / 100).toFixed(2) : "0.00",
    annualPrice:  plan ? (plan.annualPriceCents  / 100).toFixed(2) : "0.00",
    stripePriceIdMonthly: plan?.stripePriceIdMonthly ?? "",
    stripePriceIdAnnual: plan?.stripePriceIdAnnual ?? "",
    maxBooks: plan?.maxBooks?.toString() ?? "",
    maxPosts: plan?.maxPosts?.toString() ?? "",
    maxStorageMb: plan?.maxStorageMb?.toString() ?? "",
    customDomain: plan?.customDomain ?? false,
    salesEnabled: plan?.salesEnabled ?? false,
    flipBooksLimit: plan?.flipBooksLimit?.toString() ?? "0",
    audioEnabled: plan?.audioEnabled ?? false,
    newsletter: plan?.newsletter ?? false,
    analyticsEnabled: plan?.analyticsEnabled ?? false,
    badgeColor: plan?.badgeColor ?? "gray",
    featuredLabel: plan?.featuredLabel ?? "",
    sortOrder: plan?.sortOrder ?? 0,
    isActive: plan?.isActive ?? true,
    isDefault: plan?.isDefault ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function set<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      monthlyPriceCents: Math.round(parseFloat(form.monthlyPrice || "0") * 100),
      annualPriceCents:  Math.round(parseFloat(form.annualPrice  || "0") * 100),
      maxBooks: form.maxBooks === "" ? null : parseInt(form.maxBooks, 10),
      maxPosts: form.maxPosts === "" ? null : parseInt(form.maxPosts, 10),
      maxStorageMb: form.maxStorageMb === "" ? null : parseInt(form.maxStorageMb, 10),
      flipBooksLimit: parseInt(form.flipBooksLimit, 10),
      stripePriceIdMonthly: form.stripePriceIdMonthly || null,
      stripePriceIdAnnual: form.stripePriceIdAnnual || null,
      featuredLabel: form.featuredLabel || null,
      description: form.description || null,
    };

    try {
      const res = isEditing
        ? await fetch(`/api/super-admin/plans/${plan.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/super-admin/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save plan.");
        return;
      }
      router.push("/super-admin/plans");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500";
  const label = "block text-xs font-medium text-gray-400 mb-1.5";
  const selectedBadge = BADGE_OPTIONS.find((b) => b.value === form.badgeColor) ?? BADGE_OPTIONS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="rounded-lg bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 text-sm">{error}</div>}

      {/* Basic Info */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-5">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Plan Name *</label>
            <input required value={form.name} onChange={(e) => { set("name", e.target.value); if (!isEditing) set("slug", autoSlug(e.target.value)); }} placeholder="e.g. Pro" className={input} />
          </div>
          <div>
            <label className={label}>Slug *</label>
            <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. pro" className={input} />
            <p className="text-xs text-gray-600 mt-1">Lowercase, no spaces</p>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Short description shown to authors" className={input} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-5">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Monthly Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number" min={0} step="0.01"
                value={form.monthlyPrice}
                onChange={(e) => set("monthlyPrice", e.target.value)}
                placeholder="0.00"
                className={`${input} pl-7`}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Enter 0.00 for a free plan</p>
          </div>
          <div>
            <label className={label}>Annual Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number" min={0} step="0.01"
                value={form.annualPrice}
                onChange={(e) => set("annualPrice", e.target.value)}
                placeholder="0.00"
                className={`${input} pl-7`}
              />
            </div>
          </div>
          <div>
            <label className={label}>Stripe Monthly Price ID</label>
            <input value={form.stripePriceIdMonthly} onChange={(e) => set("stripePriceIdMonthly", e.target.value)} placeholder="price_xxxxxxxxxxxx" className={input} />
          </div>
          <div>
            <label className={label}>Stripe Annual Price ID</label>
            <input value={form.stripePriceIdAnnual} onChange={(e) => set("stripePriceIdAnnual", e.target.value)} placeholder="price_xxxxxxxxxxxx" className={input} />
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-1">Quantity Limits</h2>
        <p className="text-xs text-gray-500 mb-5">Leave blank for unlimited (∞)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={label}>Max Books</label>
            <input type="number" min={0} value={form.maxBooks} onChange={(e) => set("maxBooks", e.target.value)} placeholder="∞ unlimited" className={input} />
          </div>
          <div>
            <label className={label}>Max Blog Posts</label>
            <input type="number" min={0} value={form.maxPosts} onChange={(e) => set("maxPosts", e.target.value)} placeholder="∞ unlimited" className={input} />
          </div>
          <div>
            <label className={label}>Storage (MB)</label>
            <input type="number" min={0} value={form.maxStorageMb} onChange={(e) => set("maxStorageMb", e.target.value)} placeholder="∞ unlimited" className={input} />
            <p className="text-xs text-gray-600 mt-1">1000 MB = 1 GB</p>
          </div>
        </div>
      </section>

      {/* Flip Books Limit */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-1">Flip Books Limit</h2>
        <p className="text-xs text-gray-500 mb-5">
          How many standalone flip books can authors on this plan create?
          Use <code className="text-purple-400">-1</code> for unlimited.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {FLIP_BOOK_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => set("flipBooksLimit", preset.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                form.flipBooksLimit === preset.value
                  ? "border-purple-500 bg-purple-900/30 text-purple-300"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-purple-700"
              }`}
            >
              <span className="font-bold">{preset.label}</span>
              <span className="text-xs ml-1.5 opacity-60">{preset.desc}</span>
            </button>
          ))}
        </div>
        <div className="max-w-xs">
          <label className={label}>Custom value (0 = none, -1 = unlimited, n = exact limit)</label>
          <input
            type="number"
            min={-1}
            value={form.flipBooksLimit}
            onChange={(e) => set("flipBooksLimit", e.target.value)}
            className={input}
          />
        </div>
      </section>

      {/* Features */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-1">Feature Access</h2>
        <p className="text-xs text-gray-500 mb-5">Toggle the features available on this plan tier.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {([
            { key: "customDomain",    label: "Custom Domain",  desc: "Authors can map their own domain" },
            { key: "salesEnabled",    label: "Direct Sales",   desc: "Sell eBooks, flip books, print" },
            { key: "audioEnabled",    label: "Audio Previews", desc: "MP3/WAV narrations & excerpts" },
            { key: "newsletter",      label: "Newsletter",     desc: "Email subscriber management" },
            { key: "analyticsEnabled",label: "Analytics",      desc: "Traffic & sales reporting" },
          ] as const).map(({ key, label: lbl, desc }) => (
            <label
              key={key}
              className={`flex items-start gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-colors ${
                form[key]
                  ? "border-purple-500 bg-purple-900/20"
                  : "border-gray-700 bg-gray-800 hover:border-purple-700"
              }`}
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-500 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-200 font-medium leading-snug">{lbl}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Display */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-5">Display & Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Badge Color</label>
            <div className="flex gap-2 flex-wrap">
              {BADGE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => set("badgeColor", opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${opt.cls} ${form.badgeColor === opt.value ? "border-white scale-105" : "border-transparent opacity-60"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Preview:</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selectedBadge.cls}`}>{form.name || "Plan Name"}</span>
            </div>
          </div>
          <div>
            <label className={label}>Featured Label</label>
            <input value={form.featuredLabel} onChange={(e) => set("featuredLabel", e.target.value)} placeholder="e.g. Most Popular" className={input} />
          </div>
          <div>
            <label className={label}>Sort Order</label>
            <input type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} className={input} />
            <p className="text-xs text-gray-600 mt-1">Lower numbers appear first</p>
          </div>
          <div className="flex flex-col gap-3 justify-center">
            {([
              { key: "isActive" as const, label: "Active (visible to authors)", color: "bg-purple-600" },
              { key: "isDefault" as const, label: "Default plan for new signups", color: "bg-emerald-600" },
            ]).map(({ key, label: lbl, color }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => set(key, !form[key])}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form[key] ? color : "bg-gray-700"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-gray-300">{lbl}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white">← Cancel</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}
