// Shipping address for orders that include a PRINT item. Stripe Checkout collects it
// (restricted to the country chosen in the cart; see /api/checkout) and the webhook stores it on Order.shippingAddress.

export type ShippingAddress = {
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

/** Reads the address off a checkout.session.completed object (location differs by Stripe API version). */
export function shippingFromSession(session: any): ShippingAddress | null {
  const d = session?.shipping_details ?? session?.collected_information?.shipping_details;
  const a = d?.address;
  if (!a?.line1) return null;
  return {
    name: d.name ?? null,
    line1: a.line1 ?? null,
    line2: a.line2 ?? null,
    city: a.city ?? null,
    state: a.state ?? null,
    postalCode: a.postal_code ?? null,
    country: a.country ?? null,
  };
}

/** Parses the JSON column back into a ShippingAddress (or null). */
export function parseShippingAddress(value: unknown): ShippingAddress | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.line1 !== "string") return null;
  const s = (x: unknown) => (typeof x === "string" && x ? x : null);
  return { name: s(v.name), line1: s(v.line1), line2: s(v.line2), city: s(v.city), state: s(v.state), postalCode: s(v.postalCode), country: s(v.country) };
}

/** Address as display lines, e.g. ["Jane Reader", "12 Main St", "Austin, TX 78701", "US"]. */
export function shippingLines(a: ShippingAddress): string[] {
  const cityLine = [a.city, [a.state, a.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [a.name, a.line1, a.line2, cityLine, a.country].filter((x): x is string => !!x);
}
