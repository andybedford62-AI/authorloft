import { prisma } from "@/lib/db";
import { lowestBookPrice, parseFormatPrices } from "@/lib/book-formats";

/**
 * Recomputes Book.priceCents — the one price listings show — as the lowest of
 * the book's per-format prices and paid direct-sale items. Call after anything
 * that changes those. A book with no prices at all keeps its old single price
 * (books priced before per-format pricing), unless `clearIfNone` says the
 * author has just removed the last format price.
 */
export async function syncBookPrice(bookId: string, { clearIfNone = false } = {}): Promise<void> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      priceCents: true,
      formatPrices: true,
      directSaleItems: { where: { isActive: true, isReaderMagnet: false }, select: { priceCents: true } },
    },
  });
  if (!book) return;
  const lowest = lowestBookPrice(book.formatPrices, book.directSaleItems.map((i) => i.priceCents));
  const next = lowest ?? (clearIfNone ? 0 : book.priceCents);
  if (next !== book.priceCents) {
    await prisma.book.update({ where: { id: bookId }, data: { priceCents: next } });
  }
}

/** Whether a stored formatPrices value has any price in it. */
export function hasFormatPrices(formatPrices: unknown): boolean {
  return Object.keys(parseFormatPrices(formatPrices)).length > 0;
}
