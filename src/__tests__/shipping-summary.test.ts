// @vitest-environment node
import { describe, it, expect } from "vitest";
import { summarizeProfile, buyerTotalText, zoneFor } from "@/lib/shipping-summary";

const zone = (o: Partial<Parameters<typeof zoneFor>[0]["zones"][0]> & { name: string }) => ({
  countries: [], isRestOfWorld: false, firstItemCents: 0, additionalItemCents: 0, estimateNote: null, ...o,
});
const profile = {
  name: "Paperback",
  freeOverCents: 4000,
  zones: [
    zone({ name: "US", countries: ["US"], firstItemCents: 500, additionalItemCents: 200, estimateNote: "3-5 days" }),
    zone({ name: "World", isRestOfWorld: true, firstItemCents: 1200 }),
  ],
};

describe("summarizeProfile", () => {
  it("describes each zone, the catch-all and the free threshold", () => {
    const { lines, warning } = summarizeProfile(profile, "US");
    expect(lines[0]).toBe("United States: $5.00 first copy, $2.00 each additional copy (3-5 days)");
    expect(lines[1]).toBe("All other countries: $12.00 first copy");
    expect(lines[2]).toBe("Free shipping over $40.00.");
    expect(warning).toBeNull();
  });

  it("says so when no other country is shipped to", () => {
    const home = { ...profile, freeOverCents: null, zones: [profile.zones[0]] };
    expect(summarizeProfile(home, "US").lines).toContain("Not shipped to any other country.");
  });

  it("warns when the author's own country is not priced", () => {
    expect(summarizeProfile({ ...profile, zones: [profile.zones[0]] }, "CA").warning).toMatch(/no price for Canada/);
  });

  it("asks for a ship-from country when there isn't one", () => {
    expect(summarizeProfile(profile, null).warning).toMatch(/country you ship from/);
  });
});

describe("buyerTotalText", () => {
  it("adds first-copy postage for a buyer in the author's country", () => {
    expect(buyerTotalText(profile, "US", 1499)).toBe("$14.99 + $5.00 shipping = $19.99");
  });
  it("reports free shipping once the threshold is reached", () => {
    expect(buyerTotalText(profile, "US", 4500)).toBe("$45.00 with free shipping");
  });
  it("is null when it can't be priced", () => {
    expect(buyerTotalText(profile, null, 1499)).toBeNull();
    expect(buyerTotalText({ ...profile, zones: [profile.zones[0]] }, "CA", 1499)).toBeNull();
  });
});
