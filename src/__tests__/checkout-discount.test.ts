import { describe, it, expect } from "vitest";
import { calcDiscount } from "@/lib/discount-queries";

describe("calcDiscount()", () => {
  describe("PERCENT type", () => {
    it("applies a percentage discount correctly", () => {
      const { discountCents, finalPriceCents } = calcDiscount(1000, "PERCENT", 20);
      expect(discountCents).toBe(200);
      expect(finalPriceCents).toBe(800);
    });

    it("rounds half-cent percentages", () => {
      // 33% of $9.99 = 329.67 → rounds to 330
      const { discountCents } = calcDiscount(999, "PERCENT", 33);
      expect(discountCents).toBe(330);
    });

    it("handles 100% discount (free)", () => {
      const { discountCents, finalPriceCents } = calcDiscount(999, "PERCENT", 100);
      expect(discountCents).toBe(999);
      expect(finalPriceCents).toBe(0);
    });

    it("never produces a negative final price", () => {
      // Shouldn't happen with percent but guard anyway
      const { finalPriceCents } = calcDiscount(100, "PERCENT", 100);
      expect(finalPriceCents).toBeGreaterThanOrEqual(0);
    });
  });

  describe("FIXED type", () => {
    it("subtracts a fixed amount in cents", () => {
      const { discountCents, finalPriceCents } = calcDiscount(1000, "FIXED", 300);
      expect(discountCents).toBe(300);
      expect(finalPriceCents).toBe(700);
    });

    it("caps the discount at the item price (never goes negative)", () => {
      const { discountCents, finalPriceCents } = calcDiscount(500, "FIXED", 1000);
      expect(discountCents).toBe(500);
      expect(finalPriceCents).toBe(0);
    });

    it("handles a $0 discount", () => {
      const { discountCents, finalPriceCents } = calcDiscount(999, "FIXED", 0);
      expect(discountCents).toBe(0);
      expect(finalPriceCents).toBe(999);
    });
  });

  describe("multi-item cart total", () => {
    it("sums discounts across multiple items correctly", () => {
      const items = [
        { priceCents: 999 },
        { priceCents: 1499 },
        { priceCents: 599 },
      ];
      const totalDiscount = items.reduce((sum, item) => {
        return sum + calcDiscount(item.priceCents, "PERCENT", 10).discountCents;
      }, 0);
      const totalOriginal = items.reduce((sum, i) => sum + i.priceCents, 0);
      const finalTotal = Math.max(0, totalOriginal - totalDiscount);

      expect(totalDiscount).toBe(100 + 150 + 60);
      expect(finalTotal).toBe(3097 - 310);
    });
  });
});
