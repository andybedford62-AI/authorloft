// @vitest-environment node
import { describe, it, expect } from "vitest";
import { shippingFromSession, parseShippingAddress, shippingLines } from "@/lib/shipping-address";

const address = { line1: "12 Main St", line2: null, city: "Austin", state: "TX", postal_code: "78701", country: "US" };

describe("shippingFromSession", () => {
  it("reads shipping_details (older API versions)", () => {
    const s = shippingFromSession({ shipping_details: { name: "Jane Reader", address } });
    expect(s).toEqual({ name: "Jane Reader", line1: "12 Main St", line2: null, city: "Austin", state: "TX", postalCode: "78701", country: "US" });
  });
  it("reads collected_information.shipping_details (newer API versions)", () => {
    const s = shippingFromSession({ collected_information: { shipping_details: { name: "Jane Reader", address } } });
    expect(s?.line1).toBe("12 Main St");
  });
  it("returns null for digital-only orders", () => {
    expect(shippingFromSession({ customer_details: { email: "a@b.c" } })).toBeNull();
  });
});

describe("shippingLines / parseShippingAddress", () => {
  it("round-trips and formats", () => {
    const s = shippingFromSession({ shipping_details: { name: "Jane Reader", address } })!;
    expect(shippingLines(parseShippingAddress(s)!)).toEqual(["Jane Reader", "12 Main St", "Austin, TX 78701", "US"]);
  });
  it("ignores junk", () => {
    expect(parseShippingAddress(null)).toBeNull();
    expect(parseShippingAddress({ foo: 1 })).toBeNull();
  });
});
