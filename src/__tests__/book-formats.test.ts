import { describe, it, expect } from "vitest";
import {
  buildFormatOptions, parseFormatPrices, parseLinkFormats, directSaleCardFormat,
  lowestBookPrice, hasPriceRange, listingPrice,
} from "@/lib/book-formats";

const amazon = { id: "a", retailer: "amazon", label: "Buy on Amazon", url: "https://amazon.com/x", formats: [] as string[] };
const etsy = { id: "e", retailer: "etsy", label: "Buy on Etsy", url: "https://etsy.com/x", formats: ["PAPERBACK"] };
const goodreads = { id: "g", retailer: "goodreads", label: "View on Goodreads", url: "https://goodreads.com/x", formats: [] };
const ebookItem = { id: "d1", format: "EBOOK", label: "eBook", description: null, priceCents: 699 };

describe("buildFormatOptions", () => {
  const opts = buildFormatOptions({
    availableFormats: ["PAPERBACK", "EBOOK", "HARDBACK"],
    formatPrices: { EBOOK: 799, PAPERBACK: 1499 },
    retailerLinks: [amazon, etsy, goodreads],
    paidItems: [ebookItem],
    magnetItems: [],
  });

  it("orders cards Ebook, Paperback, Hardcover regardless of input order", () => {
    expect(opts.map((o) => o.id)).toEqual(["EBOOK", "PAPERBACK", "HARDBACK"]);
  });

  it("prices a card from its direct item over the list price", () => {
    expect(opts[0]).toMatchObject({ priceCents: 699, priceIsDirect: true, listPriceCents: 799 });
    expect(opts[1]).toMatchObject({ priceCents: 1499, priceIsDirect: false });
    expect(opts[2]).toMatchObject({ priceCents: null });
  });

  it("gives format-less links to every card and tagged links only to theirs; never Goodreads", () => {
    expect(opts[0].stores.map((s) => s.id)).toEqual(["a"]);
    expect(opts[1].stores.map((s) => s.id)).toEqual(["a", "e"]);
    expect(opts.flatMap((o) => o.stores).some((s) => s.retailer === "goodreads")).toBe(false);
  });

  it("adds a card for a direct-sale format the author didn't tick", () => {
    const o = buildFormatOptions({ availableFormats: [], formatPrices: null, retailerLinks: [], paidItems: [ebookItem], magnetItems: [] });
    expect(o.map((x) => x.id)).toEqual(["EBOOK"]);
  });

  it("returns no cards for a book with no formats and no direct items", () => {
    expect(buildFormatOptions({ availableFormats: [], formatPrices: null, retailerLinks: [amazon], paidItems: [], magnetItems: [] })).toEqual([]);
  });
});

describe("parsers", () => {
  it("keeps only known formats with sane integer cents", () => {
    expect(parseFormatPrices({ EBOOK: 499, PAPERBACK: "1299", HARDBACK: -5, AUDIOBOOK: 1.5, NOPE: 100 }))
      .toEqual({ EBOOK: 499, PAPERBACK: 1299 });
    expect(parseFormatPrices([1, 2])).toEqual({});
  });

  it("filters link formats to known ones in canonical order", () => {
    expect(parseLinkFormats(["HARDBACK", "EBOOK", "X", "EBOOK"])).toEqual(["EBOOK", "HARDBACK"]);
    expect(parseLinkFormats("EBOOK")).toEqual([]);
  });

  it("maps direct-sale formats to cards", () => {
    expect(directSaleCardFormat("PRINT")).toBe("PAPERBACK");
    expect(directSaleCardFormat("AUDIO")).toBe("AUDIOBOOK");
    expect(directSaleCardFormat("FLIPBOOK")).toBe("EBOOK");
  });
});

describe("single book price for listings", () => {
  it("is the lowest of format prices and paid direct items", () => {
    expect(lowestBookPrice({ PAPERBACK: 1499, HARDBACK: 2499 }, [699])).toBe(699);
    expect(lowestBookPrice({ PAPERBACK: 1499 }, [0])).toBe(1499); // a free magnet isn't a price
    expect(lowestBookPrice(null, [])).toBeNull();
  });

  it("says From only when prices actually differ", () => {
    expect(hasPriceRange({ EBOOK: 699, PAPERBACK: 1499 }, [])).toBe(true);
    expect(hasPriceRange({ EBOOK: 699 }, [699])).toBe(false);
  });

  it("falls back to the old single price for books without format prices", () => {
    expect(listingPrice({ priceCents: 1299 })).toEqual({ cents: 1299, from: false });
    expect(listingPrice({ priceCents: 0 })).toBeNull();
    expect(listingPrice({ priceCents: 1299, formatPrices: { EBOOK: 499, HARDBACK: 2499 } })).toEqual({ cents: 499, from: true });
  });
});
