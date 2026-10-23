"use client";

import { useEffect, useState } from "react";
import { Package, Check, Plus, Trash2, Pencil, Loader2, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpTip } from "@/components/admin/help-tip";
import { SHIPPING_COUNTRIES, countryName } from "@/lib/shipping-countries";
import { formatCents } from "@/lib/utils";

export const SHIPPING_HELP_URL = "/admin/help?article=ha_print_shipping";

export type ShippingZoneRow = {
  name: string;
  countries: string[];
  isRestOfWorld: boolean;
  firstItemCents: number;
  additionalItemCents: number;
  estimateNote: string | null;
};
export type ShippingProfileRow = {
  id: string;
  name: string;
  freeOverCents: number | null;
  itemCount: number;
  zones: ShippingZoneRow[];
};
type ZoneDraft = { name: string; countries: string[]; isRestOfWorld: boolean; first: string; additional: string; estimateNote: string };

const toDollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (s: string) => Math.round(parseFloat(s.trim() || "0") * 100);

const homeZone = (code: string): ZoneDraft => ({
  name: `Domestic (${countryName(code)})`, countries: [code], isRestOfWorld: false, first: "", additional: "", estimateNote: "",
});
const intlZone = (): ZoneDraft => ({
  name: "International", countries: [], isRestOfWorld: true, first: "", additional: "", estimateNote: "",
});
const customZone = (): ZoneDraft => ({
  name: "Specific countries", countries: [], isRestOfWorld: false, first: "", additional: "", estimateNote: "",
});

function zonesFrom(p: ShippingProfileRow | null, shipFrom: string | null): ZoneDraft[] {
  if (!p) return shipFrom ? [homeZone(shipFrom)] : [];
  return p.zones.map((z) => ({
    name: z.name,
    countries: z.countries,
    isRestOfWorld: z.isRestOfWorld,
    first: toDollars(z.firstItemCents),
    additional: toDollars(z.additionalItemCents),
    estimateNote: z.estimateNote ?? "",
  }));
}

/** "Example: 3 copies in one order ship for $5.00 + $2.00 + $2.00 = $9.00" from the author's own numbers. */
function Example({ z, who }: { z: ZoneDraft; who: string }) {
  const first = toCents(z.first);
  const extra = toCents(z.additional);
  if (!Number.isFinite(first) || !Number.isFinite(extra) || first <= 0) return null;
  return (
    <p className="text-xs text-gray-500 bg-white border border-dashed border-gray-300 rounded px-2.5 py-1.5">
      Example: {who} ordering 3 copies pays {formatCents(first)}
      {extra > 0 ? ` + ${formatCents(extra)} + ${formatCents(extra)}` : " + $0.00 + $0.00"} = <strong>{formatCents(first + extra * 2)}</strong> shipping.
    </p>
  );
}

function PriceFields({ z, onChange }: { z: ZoneDraft; onChange: (patch: Partial<ZoneDraft>) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">First copy</label>
        <div className="flex items-center gap-1"><span className="text-sm text-gray-500">$</span>
          <Input inputMode="decimal" value={z.first} onChange={(e) => onChange({ first: e.target.value })} placeholder="0.00" className="w-24" /></div>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">Each additional copy</label>
        <div className="flex items-center gap-1"><span className="text-sm text-gray-500">$</span>
          <Input inputMode="decimal" value={z.additional} onChange={(e) => onChange({ additional: e.target.value })} placeholder="0.00" className="w-24" /></div>
      </div>
      <div className="space-y-1 flex-1 min-w-[10rem]">
        <label className="block text-xs font-medium text-gray-600">Delivery time (optional)</label>
        <Input value={z.estimateNote} onChange={(e) => onChange({ estimateNote: e.target.value })} placeholder="e.g. 5-7 business days" maxLength={80} />
      </div>
    </div>
  );
}

/**
 * Create/edit form for one shipping profile. Used on the Settings → Shipping tab and inline in a book's
 * Direct Sales area, so authors can set up postage the moment they add a print edition.
 *
 * Simple view: a "within my country" price and an optional "other countries" price. Different prices for
 * specific countries live under "More options". All of it saves as ordinary zones.
 */
export function ShippingProfileForm({
  profile,
  shipFrom,
  onShipFromChange,
  onSaved,
  onCancel,
}: {
  profile: ShippingProfileRow | null;
  shipFrom: string | null;
  onShipFromChange?: (code: string | null) => void;
  onSaved: (saved: ShippingProfileRow) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [freeOver, setFreeOver] = useState(profile?.freeOverCents ? toDollars(profile.freeOverCents) : "");
  const [from, setFrom] = useState<string | null>(shipFrom);
  const [zones, setZones] = useState<ZoneDraft[]>(() => zonesFrom(profile, shipFrom));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const homeIdx = from ? zones.findIndex((z) => !z.isRestOfWorld && z.countries.length === 1 && z.countries[0] === from) : -1;
  const intlIdx = zones.findIndex((z) => z.isRestOfWorld && z.countries.length === 0);
  const otherIdxs = zones.map((_, i) => i).filter((i) => i !== homeIdx && i !== intlIdx);
  const [moreOpen, setMoreOpen] = useState(otherIdxs.length > 0 || !!freeOver);

  function patchZone(i: number, patch: Partial<ZoneDraft>) {
    setZones((zs) => zs.map((z, idx) => (idx === i ? { ...z, ...patch } : z)));
  }

  async function changeFrom(code: string) {
    const next = code || null;
    setFrom(next);
    onShipFromChange?.(next);
    fetch("/api/admin/shipping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipFromCountry: next }),
    }).catch(() => {});
    setZones((zs) => {
      const idx = from ? zs.findIndex((z) => !z.isRestOfWorld && z.countries.length === 1 && z.countries[0] === from) : -1;
      if (idx >= 0) {
        if (!next) return zs.filter((_, i) => i !== idx);
        return zs.map((z, i) => (i === idx ? { ...z, countries: [next], name: `Domestic (${countryName(next)})` } : z));
      }
      // No home zone yet: add one, unless that country is already priced in another zone.
      if (next && !zs.some((z) => z.countries.includes(next))) return [homeZone(next), ...zs];
      return zs;
    });
  }

  function toggleIntl(on: boolean) {
    if (on) {
      setZones((zs) => [...zs, intlZone()]);
    } else {
      const z = zones[intlIdx];
      if (z && (z.first || z.additional) && !confirm("Stop shipping to other countries? The prices you entered will be removed.")) return;
      setZones((zs) => zs.filter((_, i) => i !== intlIdx));
    }
  }

  async function save() {
    setError("");
    const payload = zones.map((z) => ({
      name: z.name.trim() || "Zone",
      countries: z.countries,
      isRestOfWorld: z.isRestOfWorld,
      firstItemCents: toCents(z.first),
      additionalItemCents: toCents(z.additional),
      estimateNote: z.estimateNote.trim() || null,
    }));
    if (payload.length === 0) {
      setError("Choose where you ship from and enter your shipping price.");
      return;
    }
    if (payload.some((z) => !Number.isFinite(z.firstItemCents) || !Number.isFinite(z.additionalItemCents))) {
      setError("Enter valid dollar amounts, for example 5.00.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(profile ? `/api/admin/shipping/profiles/${profile.id}` : "/api/admin/shipping/profiles", {
        method: profile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, freeOverCents: freeOver.trim() ? toCents(freeOver) : null, zones: payload }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error || "Could not save. Please try again.");
        return;
      }
      onSaved(d as ShippingProfileRow);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-lg border-2 border-gray-300 p-4 space-y-4 bg-white"
      // This form also renders inside the Direct Sales "add format" <form>; Enter in a field must not submit that.
      onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault(); }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{profile ? `Edit “${profile.name}”` : "New shipping profile"}</p>
        <a href={SHIPPING_HELP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0">
          <BookOpen className="h-3.5 w-3.5" /> How shipping works
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">Profile name <HelpTip id="shipping-profile" /></label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paperback" />
        </div>
        <div className="space-y-1">
          <label htmlFor="ship-from" className="block text-sm font-medium text-gray-700">I ship from</label>
          <select
            id="ship-from"
            value={from ?? ""}
            onChange={(e) => changeFrom(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Select your country…</option>
            {SHIPPING_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!from && zones.length === 0 && (
        <p className="text-xs text-gray-500">Choose the country you ship from to set your shipping price.</p>
      )}

      {homeIdx >= 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
            Shipping within {countryName(from!)} <HelpTip id="shipping-first-additional" />
          </p>
          <PriceFields z={zones[homeIdx]} onChange={(patch) => patchZone(homeIdx, patch)} />
          <Example z={zones[homeIdx]} who={`a buyer in ${countryName(from!)}`} />
        </div>
      )}

      {from && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" checked={intlIdx >= 0} onChange={(e) => toggleIntl(e.target.checked)} />
            I also ship to other countries <HelpTip id="shipping-international" />
          </label>
          {intlIdx >= 0 ? (
            <>
              <p className="text-xs text-gray-500">One price for every country that isn&apos;t listed under &ldquo;More options&rdquo;.</p>
              <PriceFields z={zones[intlIdx]} onChange={(patch) => patchZone(intlIdx, patch)} />
              <Example z={zones[intlIdx]} who="a buyer abroad" />
            </>
          ) : (
            <p className="text-xs text-gray-500">Leave this off if you only ship within {countryName(from)}.</p>
          )}
        </div>
      )}

      <div>
        <button type="button" className="text-sm text-gray-600 underline" onClick={() => setMoreOpen((v) => !v)}>
          {moreOpen ? "Hide more options" : "More options (free shipping, prices for specific countries)"}
        </button>
      </div>

      {moreOpen && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">Free shipping over (optional) <HelpTip id="shipping-free-over" /></label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <Input inputMode="decimal" value={freeOver} onChange={(e) => setFreeOver(e.target.value)} placeholder="none" className="w-28" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              Different prices for specific countries <HelpTip id="shipping-specific-countries" />
            </p>
            {otherIdxs.length === 0 && (
              <p className="text-xs text-gray-500">For example, a lower price to Canada than to the rest of the world. Most authors don&apos;t need this.</p>
            )}
            {otherIdxs.map((i) => {
              const z = zones[i];
              const otherRowExists = zones.some((zz, j) => j !== i && zz.isRestOfWorld);
              return (
                <div key={i} className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input value={z.name} onChange={(e) => patchZone(i, { name: e.target.value })} className="max-w-xs" aria-label="Group name" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Remove this group"
                      onClick={() => { if (confirm(`Remove “${z.name}”?`)) setZones((zs) => zs.filter((_, idx) => idx !== i)); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
                      {SHIPPING_COUNTRIES.map((c) => {
                        const usedIn = zones.find((zz, j) => j !== i && zz.countries.includes(c.code));
                        const here = z.countries.includes(c.code);
                        return (
                          <option key={c.code} value={c.code} disabled={!!usedIn || here}>
                            {c.name}{usedIn ? (zones.indexOf(usedIn) === homeIdx ? " (your home price)" : ` (in “${usedIn.name}”)`) : here ? " (added)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={z.isRestOfWorld}
                      disabled={!z.isRestOfWorld && otherRowExists}
                      onChange={(e) => patchZone(i, { isRestOfWorld: e.target.checked })}
                    />
                    Also use this price for every country not listed anywhere else
                  </label>
                  <PriceFields z={z} onChange={(patch) => patchZone(i, patch)} />
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => setZones((zs) => [...zs, customZone()])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add prices for specific countries
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> {profile ? "Update profile" : "Save profile"}</>}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/** Settings → Shipping tab: the author's shipping profiles (per-country postage for Print editions). */
export function ShippingSettings() {
  const [loaded, setLoaded] = useState(false);
  const [shipFrom, setShipFrom] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ShippingProfileRow[]>([]);
  // undefined = form closed, null = creating, row = editing
  const [editing, setEditing] = useState<ShippingProfileRow | null | undefined>(undefined);
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

  async function remove(p: ShippingProfileRow) {
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
        <p className="text-sm text-gray-600 mt-1">
          When you sell a print edition, you mail it yourself. A <strong>shipping profile</strong> says what you charge for postage:
          one price within your country and, if you like, one price for everywhere else. Make one profile per kind of book
          (paperback, hardcover…), then pick it on each print edition.
        </p>
        <a href={SHIPPING_HELP_URL} className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
          <BookOpen className="h-3.5 w-3.5" /> Read the shipping guide
        </a>
      </div>

      {!loaded ? (
        <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          {profiles.length === 0 && editing === undefined && (
            <p className="text-sm text-gray-500">No shipping profiles yet. Create one to start selling print editions.</p>
          )}

          {profiles.map((p) =>
            editing && editing.id === p.id ? (
              <ShippingProfileForm
                key={p.id}
                profile={p}
                shipFrom={shipFrom}
                onShipFromChange={setShipFrom}
                onSaved={() => { setEditing(undefined); load(); }}
                onCancel={() => setEditing(undefined)}
              />
            ) : (
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
                    <Button variant="outline" size="sm" onClick={() => { setError(""); setEditing(p); }}>
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
                      <span className="font-medium">{z.name}</span>: {formatCents(z.firstItemCents)} first copy
                      {z.additionalItemCents > 0 && `, ${formatCents(z.additionalItemCents)} each additional`}
                      <span className="text-gray-400">
                        {" "}({z.isRestOfWorld && z.countries.length === 0 ? "all other countries" : z.countries.map(countryName).join(", ") + (z.isRestOfWorld ? " + all other countries" : "")})
                        {z.estimateNote ? ` · ${z.estimateNote}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {editing === null && (
            <ShippingProfileForm
              profile={null}
              shipFrom={shipFrom}
              onShipFromChange={setShipFrom}
              onSaved={() => { setEditing(undefined); load(); }}
              onCancel={() => setEditing(undefined)}
            />
          )}

          {editing === undefined && (
            <Button variant="outline" onClick={() => { setError(""); setEditing(null); }}>
              <Plus className="h-4 w-4 mr-1" /> New shipping profile
            </Button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </>
      )}
    </section>
  );
}
