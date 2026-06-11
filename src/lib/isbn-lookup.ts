// Shared ISBN lookup: Google Books → Open Library fallback.
// Used by the single-book ISBN lookup (book-form.tsx) and the CSV import
// wizard's "Fill missing details from ISBN" enrichment step.

export type IsbnLookupResult = {
  title: string;
  subtitle: string;
  description: string;
  coverUrl: string;
  pageCount: number | null;
  isbn13: string;
  previewText: string; // author name(s), or "Unknown author"
};

/**
 * Looks up book metadata by ISBN (10 or 13 digit, dashes/spaces allowed).
 * Returns null if no record was found in either source.
 */
export async function lookupByIsbn(rawIsbn: string): Promise<IsbnLookupResult | null> {
  const q = rawIsbn.trim().replace(/[-\s]/g, "");
  if (!q) return null;

  // ── 1. Try Google Books ──────────────────────────────────────────────────
  try {
    const gbRes  = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(q)}&maxResults=1`);
    const gbData = await gbRes.json();

    if (gbData.items?.length) {
      const vol  = gbData.items[0].volumeInfo ?? {};
      const ids: { type: string; identifier: string }[] = vol.industryIdentifiers ?? [];
      const isbn13Entry = ids.find((x) => x.type === "ISBN_13");
      const isbn10Entry = ids.find((x) => x.type === "ISBN_10");

      let coverUrl = vol.imageLinks?.thumbnail ?? vol.imageLinks?.smallThumbnail ?? "";
      if (coverUrl) coverUrl = coverUrl.replace(/^http:/, "https:");

      return {
        title:       vol.title ?? "",
        subtitle:    vol.subtitle ?? "",
        description: vol.description ?? "",
        coverUrl,
        pageCount:   typeof vol.pageCount === "number" ? vol.pageCount : null,
        isbn13:      isbn13Entry?.identifier ?? isbn10Entry?.identifier ?? q,
        previewText: (vol.authors ?? []).join(", ") || "Unknown author",
      };
    }
  } catch {
    // Google Books unavailable — fall through to Open Library
  }

  // ── 2. Fallback: Open Library ────────────────────────────────────────────
  // Covers Amazon KDP (979-8) and other self-published books not in Google Books
  try {
    const olRes  = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${q}&format=json&jscmd=data`
    );
    const olData = await olRes.json();
    const entry  = olData[`ISBN:${q}`];

    if (entry) {
      const authors  = (entry.authors ?? []).map((a: { name: string }) => a.name).join(", ");
      const coverUrl = entry.cover?.large ?? entry.cover?.medium ?? entry.cover?.small ?? "";
      const isbnList: string[] = entry.identifiers?.isbn_13 ?? entry.identifiers?.isbn_10 ?? [q];

      // Open Library stores description as a plain string or { value: string }
      const rawDesc   = entry.description;
      const description =
        typeof rawDesc === "string" ? rawDesc
        : typeof rawDesc === "object" && rawDesc?.value ? rawDesc.value
        : "";

      return {
        title:       entry.title ?? "",
        subtitle:    entry.subtitle ?? "",
        description,
        coverUrl,
        pageCount:   typeof entry.number_of_pages === "number" ? entry.number_of_pages : null,
        isbn13:      isbnList[0] ?? q,
        previewText: authors || "Unknown author",
      };
    }
  } catch {
    // Open Library also unavailable
  }

  // ── 3. Not found in either source ────────────────────────────────────────
  return null;
}

/** True if the ISBN looks like an Amazon KDP-assigned ISBN (979-8 prefix), which is
 *  often missing from Google Books / Open Library. */
export function isKdpIsbn(rawIsbn: string): boolean {
  return rawIsbn.trim().replace(/[-\s]/g, "").startsWith("9798");
}
