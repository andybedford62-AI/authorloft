import { prisma } from "./db";

// ── Shared calculation helper ──────────────────────────────────────────────────

/**
 * Calculate discount and final price for a given code.
 * Used by both the validate endpoint and the sale-display logic.
 */
export function calcDiscount(
  priceCents: number,
  type: string,
  value: number,
): { discountCents: number; finalPriceCents: number } {
  const discountCents =
    type === "PERCENT"
      ? Math.round(priceCents * (value / 100))
      : Math.min(value, priceCents);
  return { discountCents, finalPriceCents: Math.max(0, priceCents - discountCents) };
}

// ── Active sale discount lookup ────────────────────────────────────────────────

export type SaleInfo = { discountCents: number; salePriceCents: number };

/**
 * Returns a Map<bookId, SaleInfo> for every book that has an active
 * "showAsSalePrice" discount code. One DB query covers the whole page.
 *
 * @param authorId   - The author whose codes to check
 * @param bookPriceMap - Map of bookId → priceCents for the books being displayed
 */
export async function getActiveSaleDiscounts(
  authorId: string,
  bookPriceMap: Map<string, number>,
): Promise<Map<string, SaleInfo>> {
  const now = new Date();

  const codes = await prisma.discountCode.findMany({
    where: {
      authorId,
      isActive: true,
      showAsSalePrice: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: {
      type: true,
      value: true,
      maxUses: true,
      usesCount: true,
      books: { select: { bookId: true } },
    },
  });

  // Filter out codes that have hit their usage limit
  const eligible = codes.filter(
    (c) => c.maxUses === null || c.usesCount < c.maxUses,
  );

  const result = new Map<string, SaleInfo>();

  for (const code of eligible) {
    const restrictedToBookIds = code.books.map((b) => b.bookId);
    const isSitewide = restrictedToBookIds.length === 0;

    for (const [bookId, priceCents] of bookPriceMap) {
      if (!isSitewide && !restrictedToBookIds.includes(bookId)) continue;

      const { discountCents, finalPriceCents } = calcDiscount(
        priceCents,
        code.type,
        code.value,
      );
      const saleInfo: SaleInfo = { discountCents, salePriceCents: finalPriceCents };

      // If multiple codes cover the same book, keep the largest discount
      const existing = result.get(bookId);
      if (!existing || discountCents > existing.discountCents) {
        result.set(bookId, saleInfo);
      }
    }
  }

  return result;
}
