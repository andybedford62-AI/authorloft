// Format-first book page: one card per format (Ebook, Paperback, Hardcover,
// Audiobook), each with its price and the ways to buy that format. Built once
// here so the page, its JSON-LD offers and the tests agree.

export type BookFormatId = "EBOOK" | "PAPERBACK" | "HARDBACK" | "AUDIOBOOK";

export const BOOK_FORMATS: { id: BookFormatId; name: string }[] = [
  { id: "EBOOK",     name: "Ebook" },
  { id: "PAPERBACK", name: "Paperback" },
  { id: "HARDBACK",  name: "Hardcover" },
  { id: "AUDIOBOOK", name: "Audiobook" },
];

const FORMAT_IDS = new Set<string>(BOOK_FORMATS.map((f) => f.id));

export function isBookFormat(v: unknown): v is BookFormatId {
  return typeof v === "string" && FORMAT_IDS.has(v);
}

/** Direct-sale items use their own format enum; this is the card each lands on. */
export function directSaleCardFormat(format: string): BookFormatId {
  switch (format) {
    case "PRINT": return "PAPERBACK";
    case "AUDIO": return "AUDIOBOOK";
    default:      return "EBOOK"; // EBOOK and FLIPBOOK are both digital reads
  }
}

/** Book.formatPrices (Json) → a clean { format: cents } map; anything else is dropped. */
export function parseFormatPrices(input: unknown): Partial<Record<BookFormatId, number>> {
  const out: Partial<Record<BookFormatId, number>> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!isBookFormat(k)) continue;
    const cents = typeof v === "number" ? v : Number(v);
    if (Number.isInteger(cents) && cents > 0 && cents < 10_000_00) out[k] = cents;
  }
  return out;
}

/** Retailer link formats from an API body: known formats only, no repeats. */
export function parseLinkFormats(input: unknown): BookFormatId[] {
  if (!Array.isArray(input)) return [];
  return BOOK_FORMATS.map((f) => f.id).filter((id) => input.includes(id));
}

type SaleItem = { id: string; format: string; label: string; description: string | null; priceCents: number };
type Link = { id: string; retailer: string; label: string; url: string; formats: string[] };

export type FormatOption = {
  id: BookFormatId;
  name: string;
  /** Card price: the cheapest direct item, else the author's list price, else null. */
  priceCents: number | null;
  /** True when priceCents is a direct-sale price the reader can pay here. */
  priceIsDirect: boolean;
  /** The author's list price for this format, if set. */
  listPriceCents: number | null;
  directItems: SaleItem[];
  magnetItems: SaleItem[];
  stores: Link[];
};

/**
 * The format cards for a book. A card appears for every format the author
 * ticked, plus any format a direct-sale item sells. Retailer links with no
 * formats set apply to every card, so books that predate per-link formats
 * behave as before. Goodreads is a review site, not a store — callers pass it
 * separately and it's excluded here.
 */
export function buildFormatOptions({
  availableFormats,
  formatPrices,
  retailerLinks,
  paidItems,
  magnetItems,
}: {
  availableFormats: string[];
  formatPrices: unknown;
  retailerLinks: Link[];
  paidItems: SaleItem[];
  magnetItems: SaleItem[];
}): FormatOption[] {
  const prices = parseFormatPrices(formatPrices);
  const wanted = new Set<BookFormatId>(availableFormats.filter(isBookFormat));
  for (const i of [...paidItems, ...magnetItems]) wanted.add(directSaleCardFormat(i.format));

  const stores = retailerLinks.filter((l) => l.retailer !== "goodreads");

  return BOOK_FORMATS.filter((f) => wanted.has(f.id)).map((f) => {
    const direct = paidItems.filter((i) => directSaleCardFormat(i.format) === f.id);
    const cheapest = direct.length ? Math.min(...direct.map((i) => i.priceCents)) : null;
    const list = prices[f.id] ?? null;
    return {
      id: f.id,
      name: f.name,
      priceCents: cheapest ?? list,
      priceIsDirect: cheapest !== null,
      listPriceCents: list,
      directItems: direct,
      magnetItems: magnetItems.filter((i) => directSaleCardFormat(i.format) === f.id),
      stores: stores.filter((l) => l.formats.length === 0 || l.formats.includes(f.id)),
    };
  });
}
