// @vitest-environment node
import { describe, it, expect } from "vitest";
import { quoteShipping, shippableCountries, zoneForCountry, bundleShares, type ShippingProfileData, type ShippingCartItem } from "@/lib/shipping";

const zone = (over: Partial<ShippingProfileData["zones"][0]> & { name: string }) => ({
  id: over.name, countries: [], isRestOfWorld: false, firstItemCents: 0, additionalItemCents: 0, estimateNote: null, ...over,
});

const paperback: ShippingProfileData = {
  id: "p1", name: "Paperback", freeOverCents: null,
  zones: [
    zone({ name: "US", countries: ["US"], firstItemCents: 400, additionalItemCents: 150, estimateNote: "3-5 days" }),
    zone({ name: "World", isRestOfWorld: true, firstItemCents: 1500, additionalItemCents: 800 }),
  ],
};
const hardcover: ShippingProfileData = {
  id: "p2", name: "Hardcover", freeOverCents: null,
  zones: [zone({ name: "US", countries: ["US", "CA"], firstItemCents: 700, additionalItemCents: 300 })],
};
const item = (id: string, profile: ShippingProfileData | null, priceCents = 1999): ShippingCartItem => ({ saleItemId: id, priceCents, profile });

describe("quoteShipping", () => {
  it("charges the first-item rate for a single item", () => {
    const q = quoteShipping([item("a", paperback)], "US");
    expect(q.ok && q.amountCents).toBe(400);
  });

  it("charges the additional rate for the second copy in the same profile", () => {
    const q = quoteShipping([item("a", paperback), item("b", paperback)], "US");
    expect(q.ok && q.amountCents).toBe(550);
  });

  it("mixed profiles: the highest first-item rate leads, the other pays its additional rate", () => {
    const q = quoteShipping([item("a", paperback), item("b", hardcover)], "US");
    expect(q.ok && q.amountCents).toBe(700 + 150);
  });

  it("falls back to the rest-of-world zone for unnamed countries", () => {
    const q = quoteShipping([item("a", paperback)], "DE");
    expect(q.ok && q.amountCents).toBe(1500);
  });

  it("refuses a country that has no zone and no rest-of-world catch-all", () => {
    const q = quoteShipping([item("a", paperback), item("b", hardcover)], "DE");
    expect(q).toEqual({ ok: false, reason: "NOT_SHIPPED", saleItemIds: ["b"] });
  });

  it("refuses items with no profile instead of charging $0", () => {
    const q = quoteShipping([item("a", null)], "US");
    expect(q).toEqual({ ok: false, reason: "NO_PROFILE", saleItemIds: ["a"] });
  });

  it("free-shipping threshold zeroes only the profile that clears it", () => {
    const freeOver30: ShippingProfileData = { ...paperback, freeOverCents: 3000 };
    const free = quoteShipping([item("a", freeOver30, 1999), item("b", freeOver30, 1999)], "US");
    expect(free.ok && free.amountCents).toBe(0);
    expect(free.ok && free.freeApplied).toBe(true);

    const notYet = quoteShipping([item("a", freeOver30, 1999)], "US");
    expect(notYet.ok && notYet.amountCents).toBe(400);

    const mixed = quoteShipping([item("a", freeOver30, 1999), item("b", freeOver30, 1999), item("c", hardcover)], "US");
    expect(mixed.ok && mixed.amountCents).toBe(700);
  });

  it("is deterministic when first-item rates tie", () => {
    const a = quoteShipping([item("x", paperback), item("y", paperback)], "US");
    const b = quoteShipping([item("y", paperback), item("x", paperback)], "US");
    expect(a.ok && b.ok && a.breakdown.lines.map((l) => l.saleItemId)).toEqual(b.ok && b.breakdown.lines.map((l) => l.saleItemId));
  });

  it("collects de-duplicated estimate notes", () => {
    const q = quoteShipping([item("a", paperback), item("b", paperback)], "US");
    expect(q.ok && q.estimateNotes).toEqual(["3-5 days"]);
  });
});

describe("bundleShares", () => {
  it("splits the bundle price in proportion to list prices, digital items included", () => {
    const shares = bundleShares([{ id: "ebook", priceCents: 500 }, { id: "print", priceCents: 1500 }], 1600);
    expect(shares.get("ebook")).toBe(400);
    expect(shares.get("print")).toBe(1200);
  });

  it("lets a discounted bundle miss a free-shipping threshold its list prices would clear", () => {
    const freeOver30: ShippingProfileData = { ...paperback, freeOverCents: 3000 };
    const listPrice = quoteShipping([item("p", freeOver30, 3500)], "US");
    expect(listPrice.ok && listPrice.amountCents).toBe(0);
    const share = bundleShares([{ id: "p", priceCents: 3500 }, { id: "e", priceCents: 1500 }], 2500).get("p")!;
    const bundled = quoteShipping([item("p", freeOver30, share)], "US");
    expect(bundled.ok && bundled.amountCents).toBe(400);
  });

  it("falls back to an even split when every list price is zero", () => {
    expect(bundleShares([{ id: "a", priceCents: 0 }, { id: "b", priceCents: 0 }], 1000).get("a")).toBe(500);
  });
});

describe("shippableCountries / zoneForCountry", () => {
  it("only offers countries every item in the cart can ship to", () => {
    const codes = shippableCountries([item("a", paperback), item("b", hardcover)]).map((c) => c.code);
    expect(codes.sort()).toEqual(["CA", "US"]);
  });

  it("offers the whole list when every profile has a rest-of-world zone", () => {
    expect(shippableCountries([item("a", paperback)]).length).toBeGreaterThan(50);
  });

  it("prefers a named zone over rest-of-world", () => {
    expect(zoneForCountry(paperback, "US")?.firstItemCents).toBe(400);
  });
});
