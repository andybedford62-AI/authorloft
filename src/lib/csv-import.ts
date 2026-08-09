// Column-mapping presets and row normalization for the Books CSV import wizard.
// Supports a Goodreads "Export Library" CSV (auto-detected) and a generic
// AuthorLoft template, with a manual column-mapper fallback for anything else.

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type BookFieldKey =
  | "title"
  | "subtitle"
  | "description"
  | "coverImageUrl"
  | "isbn"
  | "price"
  | "genres"
  | "series"
  | "releaseDate"
  | "availableFormats"
  | "pageCount";

export const BOOK_FIELDS: { key: BookFieldKey; label: string; required?: boolean; hint?: string }[] = [
  { key: "title",            label: "Title",            required: true },
  { key: "subtitle",         label: "Subtitle" },
  { key: "description",      label: "Description" },
  { key: "coverImageUrl",    label: "Cover Image URL" },
  { key: "isbn",             label: "ISBN" },
  { key: "price",            label: "Price (USD)" },
  { key: "genres",           label: "Genres",  hint: "Comma-separated" },
  { key: "series",           label: "Series" },
  { key: "releaseDate",      label: "Release Date" },
  { key: "availableFormats", label: "Formats", hint: "eBook, Paperback, Hardback, Audiobook" },
  { key: "pageCount",        label: "Page Count" },
];

/** Maps a Book field to the CSV header that supplies it (or unmapped). */
export type ColumnMapping = Partial<Record<BookFieldKey, string>>;

export type DetectedPreset = "goodreads" | "generic";

// ── Auto-detection ───────────────────────────────────────────────────────────

const FIELD_ALIASES: Record<BookFieldKey, string[]> = {
  title:            ["title", "book title", "name"],
  subtitle:         ["subtitle", "sub-title", "sub title"],
  description:      ["description", "synopsis", "summary", "blurb"],
  coverImageUrl:    ["cover image url", "cover url", "cover", "image", "image url"],
  isbn:             ["isbn", "isbn13", "isbn-13", "isbn 13"],
  price:            ["price", "retail price", "price (usd)"],
  genres:           ["genres", "genre", "categories", "category", "bookshelves"],
  series:           ["series", "series name"],
  releaseDate:      ["release date", "publication date", "published", "pub date", "year published", "original publication year"],
  availableFormats: ["formats", "format", "available formats", "binding"],
  pageCount:        ["page count", "pages", "number of pages"],
};

function findHeader(headers: string[], aliases: string[]): string | undefined {
  for (const alias of aliases) {
    const match = headers.find((h) => h.trim().toLowerCase() === alias);
    if (match) return match;
  }
  return undefined;
}

/** Detects whether `headers` look like a Goodreads "Export Library" CSV and
 *  builds the best-guess column mapping for either format. */
export function detectMapping(headers: string[]): { preset: DetectedPreset; mapping: ColumnMapping } {
  const lower = new Set(headers.map((h) => h.trim().toLowerCase()));
  const isGoodreads = lower.has("exclusive shelf") && (lower.has("isbn13") || lower.has("isbn"));

  if (isGoodreads) return { preset: "goodreads", mapping: buildGoodreadsMapping(headers) };
  return { preset: "generic", mapping: buildGenericMapping(headers) };
}

function buildGenericMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const field of BOOK_FIELDS) {
    const header = findHeader(headers, FIELD_ALIASES[field.key]);
    if (header) mapping[field.key] = header;
  }
  return mapping;
}

function buildGoodreadsMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const has = (name: string) => headers.find((h) => h.trim().toLowerCase() === name.toLowerCase());

  const title = has("Title");
  if (title) mapping.title = title;

  const isbn = has("ISBN13") ?? has("ISBN");
  if (isbn) mapping.isbn = isbn;

  const pages = has("Number of Pages");
  if (pages) mapping.pageCount = pages;

  const bookshelves = has("Bookshelves") ?? has("Exclusive Shelf");
  if (bookshelves) mapping.genres = bookshelves;

  const year = has("Original Publication Year") ?? has("Year Published");
  if (year) mapping.releaseDate = year;

  return mapping;
}

// ── Normalization helpers ────────────────────────────────────────────────────

/** Goodreads wraps ISBN/ISBN13 cells as `="1234567890123"` (Excel formula escape). */
export function unwrapGoodreadsCell(value: string): string {
  const trimmed = value.trim();
  const m = trimmed.match(/^="?(.*?)"?$/);
  return m ? m[1] : trimmed;
}

export function splitList(value: string): string[] {
  return value.split(/[,|;]/).map((s) => s.trim()).filter(Boolean);
}

// Goodreads "Bookshelves" includes status shelves that aren't real genres.
const GOODREADS_NON_GENRE_SHELVES = new Set([
  "read", "to-read", "currently-reading", "owned", "to-buy", "favorites",
  "favourites", "did-not-finish", "dnf", "wishlist", "my-books", "default",
]);

export function filterGoodreadsShelves(shelves: string[]): string[] {
  return shelves.filter((s) => !GOODREADS_NON_GENRE_SHELVES.has(s.toLowerCase()));
}

/** Parses a release date cell. Accepts ISO/locale dates or a bare 4-digit year (-> Jan 1). */
export function parseReleaseDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function parsePriceToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

const FORMAT_ALIASES: Record<string, string> = {
  ebook: "EBOOK", "e-book": "EBOOK", kindle: "EBOOK", epub: "EBOOK",
  paperback: "PAPERBACK", print: "PAPERBACK", "trade paperback": "PAPERBACK", softcover: "PAPERBACK",
  hardback: "HARDBACK", hardcover: "HARDBACK",
  audiobook: "AUDIOBOOK", audio: "AUDIOBOOK",
};

export function normalizeFormats(value: string): string[] {
  const out = new Set<string>();
  for (const part of splitList(value)) {
    const mapped = FORMAT_ALIASES[part.toLowerCase()];
    if (mapped) out.add(mapped);
  }
  return Array.from(out);
}

// ── Row mapping ───────────────────────────────────────────────────────────────

export type MappedBookRow = {
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  isbn: string | null;
  priceCents: number;
  genreNames: string[];
  seriesName: string | null;
  releaseDate: string | null;
  availableFormats: string[];
  pageCount: number | null;
};

/** Applies a column mapping to one raw CSV row, normalizing values per field. */
export function mapRow(
  row: Record<string, string>,
  mapping: ColumnMapping,
  preset: DetectedPreset
): MappedBookRow {
  const get = (key: BookFieldKey): string => {
    const header = mapping[key];
    if (!header) return "";
    return (row[header] ?? "").trim();
  };

  let isbn = get("isbn");
  if (preset === "goodreads" && isbn) isbn = unwrapGoodreadsCell(isbn);

  let genreNames = get("genres") ? splitList(get("genres")) : [];
  if (preset === "goodreads") genreNames = filterGoodreadsShelves(genreNames);

  const priceRaw     = get("price");
  const pageCountRaw = get("pageCount");
  const releaseRaw   = get("releaseDate");
  const formatsRaw   = get("availableFormats");

  return {
    title:            get("title"),
    subtitle:         get("subtitle") || null,
    description:      get("description") || null,
    coverImageUrl:    get("coverImageUrl") || null,
    isbn:             isbn || null,
    priceCents:       priceRaw ? parsePriceToCents(priceRaw) : 0,
    genreNames,
    seriesName:       get("series") || null,
    releaseDate:      releaseRaw ? parseReleaseDate(releaseRaw) : null,
    availableFormats: formatsRaw ? normalizeFormats(formatsRaw) : [],
    pageCount:        pageCountRaw ? (parseInt(pageCountRaw, 10) || null) : null,
  };
}
