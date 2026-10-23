"use client";

import { useEffect, useState } from "react";
import { Package, Check, Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHIPPING_COUNTRIES, countryName } from "@/lib/shipping-countries";
import { formatCents } from "@/lib/utils";

type Zone = {
  name: string;
  countries: string[];
  isRestOfWorld: boolean;
  firstItemCents: number;
  additionalItemCents: number;
  estimateNote: string | null;
};
type Profile = { id: string; name: string; freeOverCents: number | null; itemCount: number; zones: Zone[] };
type Draft = { id: string | null; name: string; freeOver: string; zones: ZoneDraft[] };
type ZoneDraft = { name: string; countries: string[]; isRestOfWorld: boolean; first: string; additional: string; estimateNote: string };

const toDollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (s: string) => Math.round(parseFloat(s.trim() || "0") * 100);

function emptyZone(shipFrom: string | null, isFirst: boolean): ZoneDraft {
  return {
    name: isFirst && shipFrom ? `Domestic (${countryName(shipFrom)})` : isFirst ? "Domestic" : "International",
    countries: isFirst && shipFrom ? [shipFrom] : [],
    isRestOfWorld: !isFirst,
    first: "",
    additional: "",
    estimateNote: "",
  };
}

function draftFrom(p: Profile): Draft {
  return {
    id: p.id,
    name: p.name,
    freeOver: p.freeOverCents ? toDollars(p.freeOverCents) : "",
    zones: p.zones.map((z) => ({
      name: z.name,
      countries: z.countries,
      isRestOfWorld: z.isRestOfWorld,
      first: toDollars(z.firstItemCents),
      additional: toDollars(z.additionalItemCents),
      estimateNote: z.estimateNote ?? "",
    })),
  };
}

/** Settings card: the author's shipping profiles (per-country postage for Print editions). */
export function ShippingSettings() {
  const [loaded, setLoaded] = useState(false);
  const [shipFrom, setShipFrom] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const d = await fetch("/api/admin/shipping").then((r) => r.json());
      setShipFrom(d.shipFromCountry ?? null);
      setProfiles(d.profiles ?? []);
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => { load(); }, []);

  async function changeShipFrom(code: string) {
    setShipFrom(code || null);
    await fetch("/api/admin/shipping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipFromCountry: code || null }),
    });
  }

  function startNew() {
    setError("");
    setDraft({ id: null, name: "", freeOver: "", zones: [emptyZone(shipFrom, true), emptyZone(shipFrom, false)] });
  }

  function patchZone(i: number, patch: Partial<ZoneDraft>) {
    setDraft((d) => d && { ...d, zones: d.zones.map((z, idx) => (idx === i ? { ...z, ...patch } : z)) });
  }

  async function save() {
    if (!draft) return;
    setError("");
    const freeOver = draft.freeOver.trim() ? toCents(draft.freeOver) : null;
    const zones = draft.zones.map((z) => ({
      name: z.name.trim(),
      countries: z.countries,
      isRestOfWorld: z.isRestOfWorld,
      firstItemCents: toCents(z.first),
      additionalItemCents: toCents(z.additional),
      estimateNote: z.estimateNote.trim() || null,
    }));
    if (zones.some((z) => !Number.isFinite(z.firstItemCents) || !Number.isFinite(z.additionalItemCents))) {
      setError("Enter valid dollar amounts.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(draft.id ? `/api/admin/shipping/profiles/${draft.id}` : "/api/admin/shipping/profiles", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, freeOverCents: freeOver, zones }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error || "Could not save. Please try again.");
        return;
      }
      setDraft(null);
      await load();
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Profile) {
    if (!confirm(`Delete the "${p.name}" shipping profile? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/admin/shipping/profiles/${p.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error || "Could not delete.");
      return;
    }
    await load();
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          Print shipping
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Create a shipping profile for each kind of print edition (paperback, hardcover, a signed bundle…). Each profile has
          zones, groups of countries with their own price. You ship the copies yourself, so set prices that cover your real
          postage. A country not covered by any zone can&apos;t order that edition. Amounts are in US dollars.
        </p>
      </div>

      {!loaded ? (
        <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          <div className="space-y-1">
            <label htmlFor="ship-from" className="block text-sm font-medium text-gray-700">I ship from</label>
            <select
              id="ship-from"
              value={shipFrom ?? ""}
              onChange={(e) => changeShipFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select a country…</option>
              {SHIPPING_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          {profiles.length === 0 && !draft && (
            <p className="text-sm text-gray-500">No shipping profiles yet. Create one, then choose it on each print edition.</p>
          )}

          {profiles.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    Used by {p.itemCount} print edition{p.itemCount === 1 ? "" : "s"}
                    {p.freeOverCents ? ` · free shipping over ${formatCents(p.freeOverCents)}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setError(""); setDraft(draftFrom(p)); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-0.5">
                {p.zones.map((z, i) => (
                  <li key={i}>
                    <span className="font-medium">{z.name}</span>: {formatCents(z.firstItemCents)} first
                    {z.additionalItemCents > 0 && ` + ${formatCents(z.additionalItemCents)} each additional`}
                    <span className="text-gray-400">
                      {" "}({z.isRestOfWorld ? "rest of world" : z.countries.map(countryName).join(", ")})
                      {z.estimateNote ? ` · ${z.estimateNote}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {draft && (
            <div className="rounded-lg border-2 border-gray-300 p-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Profile name</label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Paperback" className="w-56" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Free shipping over (optional)</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">$</span>
                    <Input inputMode="decimal" value={draft.freeOver} onChange={(e) => setDraft({ ...draft, freeOver: e.target.value })} placeholder="none" className="w-28" />
                  </div>
                </div>
              </div>

              {draft.zones.map((z, i) => (
                <div key={i} className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input value={z.name} onChange={(e) => patchZone(i, { name: e.target.value })} className="max-w-xs" aria-label="Zone name" />
                    {draft.zones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { if (confirm(`Remove the "${z.name}" zone?`)) setDraft({ ...draft, zones: draft.zones.filter((_, idx) => idx !== i) }); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {z.countries.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-300 px-2 py-0.5 text-xs">
                        {countryName(c)}
                        <button type="button" aria-label={`Remove ${countryName(c)}`} onClick={() => patchZone(i, { countries: z.countries.filter((x) => x !== c) })}>
                          <X className="h-3 w-3 text-gray-400 hover:text-gray-700" />
                        </button>
                      </span>
                    ))}
                    <select
                      value=""
                      onChange={(e) => e.target.value && patchZone(i, { countries: [...z.countries, e.target.value] })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs bg-white"
                      aria-label="Add a country"
                    >
                      <option value="">+ Add country…</option>
                      {SHIPPING_COUNTRIES
                        .filter((c) => !draft.zones.some((zz) => zz.countries.includes(c.code)))
                        .map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={z.isRestOfWorld}
                      disabled={!z.isRestOfWorld && draft.zones.some((zz) => zz.isRestOfWorld)}
                      onChange={(e) => patchZone(i, { isRestOfWorld: e.target.checked })}
                    />
                    Also apply to every other country not listed in this profile (rest of world)
                  </label>

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">First item</label>
                      <div className="flex items-center gap-1"><span className="text-sm text-gray-500">$</span>
                        <Input inputMode="decimal" value={z.first} onChange={(e) => patchZone(i, { first: e.target.value })} placeholder="0.00" className="w-24" /></div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Each additional item</label>
                      <div className="flex items-center gap-1"><span className="text-sm text-gray-500">$</span>
                        <Input inputMode="decimal" value={z.additional} onChange={(e) => patchZone(i, { additional: e.target.value })} placeholder="0.00" className="w-24" /></div>
                    </div>
                    <div className="space-y-1 flex-1 min-w-[10rem]">
                      <label className="block text-xs font-medium text-gray-600">Delivery estimate (optional)</label>
                      <Input value={z.estimateNote} onChange={(e) => patchZone(i, { estimateNote: e.target.value })} placeholder="5-7 business days" maxLength={80} />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, zones: [...draft.zones, { ...emptyZone(shipFrom, false), isRestOfWorld: false, name: "New zone" }] })}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add zone
              </Button>

              <div className="flex gap-2 pt-1">
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> {draft.id ? "Update profile" : "Save profile"}</>}
                </Button>
                <Button variant="ghost" onClick={() => { setDraft(null); setError(""); }}>Cancel</Button>
              </div>
            </div>
          )}

          {!draft && (
            <Button variant="outline" onClick={startNew}>
              <Plus className="h-4 w-4 mr-1" /> New shipping profile
            </Button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </>
      )}
    </section>
  );
}
