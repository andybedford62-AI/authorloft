import { SHIPPING_COUNTRIES } from "@/lib/shipping-countries";

/**
 * Print-shipping rate maths. Pure (no DB, no Stripe) so the cart preview, the checkout route
 * and the tests all price a cart identically.
 *
 * Rule: for the destination country, every print item looks up its profile's zone. The item with
 * the highest first-item rate pays that rate; every other item pays its own zone's additional-item
 * rate. A profile whose print subtotal reaches its free-shipping threshold contributes nothing.
 * If any print item has no zone for the country, the cart can't ship there at all.
 */

export type ShippingZoneData = {
  id: string;
  name: string;
  countries: string[];
  isRestOfWorld: boolean;
  firstItemCents: number;
  additionalItemCents: number;
  estimateNote: string | null;
};

export type ShippingProfileData = {
  id: string;
  name: string;
  freeOverCents: number | null;
  zones: ShippingZoneData[];
};

/** One print item in the cart. `priceCents` is the list price (before discount codes). */
export type ShippingCartItem = {
  saleItemId: string;
  priceCents: number;
  profile: ShippingProfileData | null;
};

export type ShippingQuote =
  | {
      ok: true;
      amountCents: number;
      freeApplied: boolean;
      /** Estimate notes of the zones used, de-duplicated (e.g. "5-7 business days"). */
      estimateNotes: string[];
      breakdown: {
        country: string;
        amountCents: number;
        freeApplied: boolean;
        lines: { saleItemId: string; profileName: string; zoneName: string; chargeCents: number; role: "first" | "additional" | "free" }[];
      };
    }
  | { ok: false; reason: "NO_PROFILE" | "NOT_SHIPPED"; saleItemIds: string[] };

export function zoneForCountry(profile: ShippingProfileData, country: string): ShippingZoneData | null {
  const named = profile.zones.find((z) => z.countries.includes(country));
  if (named) return named;
  return profile.zones.find((z) => z.isRestOfWorld) ?? null;
}

export function quoteShipping(items: ShippingCartItem[], country: string): ShippingQuote {
  const noProfile = items.filter((i) => !i.profile).map((i) => i.saleItemId);
  if (noProfile.length > 0) return { ok: false, reason: "NO_PROFILE", saleItemIds: noProfile };

  const resolved = items.map((i) => ({ item: i, profile: i.profile!, zone: zoneForCountry(i.profile!, country) }));
  const unshippable = resolved.filter((r) => !r.zone).map((r) => r.item.saleItemId);
  if (unshippable.length > 0) return { ok: false, reason: "NOT_SHIPPED", saleItemIds: unshippable };

  // Profiles whose print subtotal clears their free-shipping threshold.
  const subtotalByProfile = new Map<string, number>();
  for (const r of resolved) subtotalByProfile.set(r.profile.id, (subtotalByProfile.get(r.profile.id) ?? 0) + r.item.priceCents);
  const isFree = (profile: ShippingProfileData) =>
    profile.freeOverCents != null && profile.freeOverCents > 0 && (subtotalByProfile.get(profile.id) ?? 0) >= profile.freeOverCents;

  const paying = resolved.filter((r) => !isFree(r.profile));
  // Highest first-item rate leads; ties broken by id so the result is deterministic.
  paying.sort((a, b) => b.zone!.firstItemCents - a.zone!.firstItemCents || a.item.saleItemId.localeCompare(b.item.saleItemId));

  const lines: NonNullable<Extract<ShippingQuote, { ok: true }>["breakdown"]>["lines"] = [];
  let amountCents = 0;
  paying.forEach((r, idx) => {
    const charge = idx === 0 ? r.zone!.firstItemCents : r.zone!.additionalItemCents;
    amountCents += charge;
    lines.push({ saleItemId: r.item.saleItemId, profileName: r.profile.name, zoneName: r.zone!.name, chargeCents: charge, role: idx === 0 ? "first" : "additional" });
  });
  for (const r of resolved.filter((r) => isFree(r.profile))) {
    lines.push({ saleItemId: r.item.saleItemId, profileName: r.profile.name, zoneName: r.zone!.name, chargeCents: 0, role: "free" });
  }

  const freeApplied = resolved.some((r) => isFree(r.profile));
  const estimateNotes = [...new Set(resolved.map((r) => r.zone!.estimateNote?.trim()).filter((n): n is string => !!n))];
  return { ok: true, amountCents, freeApplied, estimateNotes, breakdown: { country, amountCents, freeApplied, lines } };
}

/** Countries every print item in the cart can ship to (the cart's destination dropdown). */
export function shippableCountries(items: ShippingCartItem[]): { code: string; name: string }[] {
  if (items.length === 0 || items.some((i) => !i.profile)) return [];
  return SHIPPING_COUNTRIES.filter((c) => items.every((i) => zoneForCountry(i.profile!, c.code) !== null));
}
