"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UploadCloud, X, ImageIcon, Link2, Tablet, BookOpen, BookMarked, Headphones, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Series = { id: string; name: string };
type Genre  = { id: string; name: string; parentName?: string };

type BookData = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  priceCents: number;            // retail / display price shown on public book page
  seriesId: string | null;
  isbn: string | null;
  pageCount: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  directSalesEnabled: boolean;
  genreIds: string[];
  availableFormats: string[];
  caption: string | null;
  releaseDate: string | null;  // YYYY-MM-DD string for the date input
};

type BookFormProps = {
  mode: "new" | "edit";
  book?: BookData;
  series: Series[];
  genres: Genre[];
  activeTab?: string; // injected by BookEditTabsClient; undefined = standalone (new book)
};

// ── Cover upload widget ────────────────────────────────────────────────────────

type CoverUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

function CoverUpload({ value, onChange }: CoverUploadProps) {
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(!!value);
  const [dragging, setDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploadError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res  = await fetch("/api/admin/upload/cover", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) setUploadError(data.error ?? "Upload failed. Please try again.");
      else onChange(data.url);
    } catch {
      setUploadError("Network error — could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (value) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview"
            className="h-44 w-auto rounded-lg shadow border border-gray-200 object-cover" />
          <div className="flex flex-col gap-2 pt-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60">
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading…</>
                : <><UploadCloud className="h-3.5 w-3.5" />Replace image</>}
            </button>
            <button type="button" onClick={() => setShowUrlInput((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <Link2 className="h-3.5 w-3.5" />
              {showUrlInput ? "Hide URL" : "Paste URL instead"}
            </button>
            <button type="button" onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors">
              <X className="h-3.5 w-3.5" />Remove
            </button>
          </div>
        </div>
        {showUrlInput && (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
        )}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Cover Image</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer
          ${dragging ? "border-[var(--accent)] bg-[color:var(--accent)]/5" : "border-gray-300 bg-gray-50 hover:border-[var(--accent)] hover:bg-[color:var(--accent)]/5"}
          ${uploading ? "pointer-events-none opacity-70" : ""}`}>
        {uploading ? (
          <><Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" /><p className="text-sm text-gray-500">Uploading…</p></>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow border border-gray-200">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop an image here, or{" "}
                <span className="text-[var(--accent)] underline underline-offset-2">click to browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP or GIF · max 5 MB</p>
            </div>
          </>
        )}
      </div>
      <div className="space-y-1">
        <button type="button" onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <Link2 className="h-3 w-3" />
          {showUrlInput ? "Hide URL field" : "Or paste an image URL instead"}
        </button>
        {showUrlInput && (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
        )}
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only" onChange={handleFileChange} />
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠ {msg}</p>;
}

function Req() {
  return <span className="text-red-500 ml-0.5" aria-hidden>*</span>;
}

// ── BookForm ───────────────────────────────────────────────────────────────────

export function BookForm({ mode, book, series, genres, activeTab }: BookFormProps) {
  const router = useRouter();
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle]           = useState(book?.title ?? "");
  const [slug, setSlug]             = useState(book?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [subtitle, setSubtitle]     = useState(book?.subtitle ?? "");
  const [shortDescription, setShortDescription] = useState(book?.shortDescription ?? "");
  const [description, setDescription]           = useState(book?.description ?? "");
  const [coverImageUrl, setCoverImageUrl]       = useState(book?.coverImageUrl ?? "");
  const [seriesId, setSeriesId]     = useState(book?.seriesId ?? "");
  const [isbn, setIsbn]             = useState(book?.isbn ?? "");
  const [pageCount, setPageCount]   = useState(book?.pageCount?.toString() ?? "");
  const [retailPrice, setRetailPrice] = useState(
    book?.priceCents ? (book.priceCents / 100).toFixed(2) : ""
  );
  const [isFeatured, setIsFeatured]               = useState(book?.isFeatured ?? false);
  const [isPublished, setIsPublished]             = useState(book?.isPublished ?? true);
  const [directSalesEnabled, setDirectSalesEnabled] = useState(book?.directSalesEnabled ?? false);
  const [selectedGenres, setSelectedGenres]       = useState<string[]>(book?.genreIds ?? []);
  const [availableFormats, setAvailableFormats]   = useState<string[]>(book?.availableFormats ?? []);
  const [caption, setCaption]                     = useState(book?.caption ?? "");
  const [releaseDate, setReleaseDate]             = useState(book?.releaseDate ?? "");

  // ── ISBN lookup state ─────────────────────────────────────────────────────
  const [isbnQuery,      setIsbnQuery]      = useState("");
  const [isbnLooking,    setIsbnLooking]    = useState(false);
  const [isbnResult,     setIsbnResult]     = useState<{
    title: string;
    subtitle: string;
    description: string;
    coverUrl: string;
    pageCount: number | null;
    isbn13: string;
    previewText: string; // author(s) line for the result card
  } | null>(null);
  const [isbnError,      setIsbnError]      = useState("");
  const [isbnApplied,    setIsbnApplied]    = useState(false);

  // ── ISBN lookup (Google Books → Open Library fallback) ───────────────────
  async function lookupByISBN() {
    const q = isbnQuery.trim().replace(/[-\s]/g, "");
    if (!q) return;
    setIsbnLooking(true);
    setIsbnError("");
    setIsbnResult(null);
    setIsbnApplied(false);

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

        setIsbnResult({
          title:       vol.title ?? "",
          subtitle:    vol.subtitle ?? "",
          description: vol.description ?? "",
          coverUrl,
          pageCount:   typeof vol.pageCount === "number" ? vol.pageCount : null,
          isbn13:      isbn13Entry?.identifier ?? isbn10Entry?.identifier ?? q,
          previewText: (vol.authors ?? []).join(", ") || "Unknown author",
        });
        setIsbnLooking(false);
        return;
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

        setIsbnResult({
          title:       entry.title ?? "",
          subtitle:    entry.subtitle ?? "",
          description,
          coverUrl,
          pageCount:   typeof entry.number_of_pages === "number" ? entry.number_of_pages : null,
          isbn13:      isbnList[0] ?? q,
          previewText: authors || "Unknown author",
        });
        setIsbnLooking(false);
        return;
      }
    } catch {
      // Open Library also unavailable
    }

    // ── 3. Not found in either source ────────────────────────────────────────
    setIsbn(q);
    const isKdp = q.startsWith("9798");
    setIsbnError(
      isKdp
        ? "This looks like an Amazon KDP ISBN (979-8‑…). KDP books often aren't in public databases — the ISBN has been filled in below. Please enter the title, description, and cover manually."
        : "No book found for that ISBN. The ISBN has been filled in below — please enter the remaining details manually."
    );
    setIsbnLooking(false);
  }

  function applyIsbnData() {
    if (!isbnResult) return;
    if (isbnResult.title)       { setTitle(isbnResult.title); setSlugManual(false); }
    if (isbnResult.subtitle)    setSubtitle(isbnResult.subtitle);
    if (isbnResult.description) setDescription(isbnResult.description);
    if (isbnResult.coverUrl)    setCoverImageUrl(isbnResult.coverUrl);
    if (isbnResult.pageCount)   setPageCount(String(isbnResult.pageCount));
    if (isbnResult.isbn13)      setIsbn(isbnResult.isbn13);
    setIsbnApplied(true);
  }

  // Auto-generate slug from title when not manually overridden
  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  function toggleGenre(id: string) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!slug.trim())  errs.slug  = "Slug is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setTimeout(() => {
        document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setFieldErrors({});
    setSaving(true);

    const payload = {
      title,
      slug,
      subtitle:         subtitle || null,
      shortDescription: shortDescription || null,
      description:      description || null,
      coverImageUrl:    coverImageUrl || null,
      seriesId:         seriesId || null,
      isbn:             isbn || null,
      pageCount:        pageCount ? parseInt(pageCount) : null,
      isFeatured,
      isPublished,
      directSalesEnabled,
      genreIds: selectedGenres,
      availableFormats,
      caption:     caption || null,
      releaseDate: releaseDate || null,
      priceCents:  retailPrice ? Math.round(parseFloat(retailPrice) * 100) : 0,
    };

    const url    = mode === "edit" ? `/api/admin/books/${book!.id}` : "/api/admin/books";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error || "Something went wrong. Please try again.";
      if (msg.toLowerCase().includes("slug")) {
        setFieldErrors({ slug: msg });
      } else {
        setError(msg);
      }
      setSaving(false);
      return;
    }

    const saved = await res.json();

    if (mode === "new" && saved?.id) {
      // Go straight to edit so the author can add Direct Sales items and Buy Links
      router.push(`/admin/books/${saved.id}/edit`);
    } else {
      router.push("/admin/books");
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${book?.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/books/${book!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/books");
      router.refresh();
    } else {
      setError("Could not delete book.");
      setDeleting(false);
    }
  }

  // When used inside the tab wrapper, show/hide sections by tab.
  // When standalone (new book, no activeTab), show everything.
  const showDetails      = !activeTab || activeTab === "details";
  const showOrganisation = !activeTab || activeTab === "organisation";
  // Hide the entire form when a non-form tab is active (state is preserved in memory)
  const formHidden = !!activeTab && activeTab !== "details" && activeTab !== "organisation";

  const textareaClass =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  const selectClass =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  return (
    <form onSubmit={handleSubmit} className={`space-y-6${formHidden ? " hidden" : ""}`}>

      {/* ── ISBN Lookup ──────────────────────────────────────────────────────── */}
      {showDetails && <section className="bg-blue-50 rounded-xl border border-blue-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            Import by ISBN
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Enter an ISBN (10 or 13 digits) to pre-fill book details. We search both
            Google Books and Open Library — covering traditionally published and many
            self-published titles. You can edit any field after importing.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={isbnQuery}
            onChange={(e) => { setIsbnQuery(e.target.value); setIsbnError(""); setIsbnResult(null); setIsbnApplied(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookupByISBN(); } }}
            placeholder="e.g. 978-0-7432-7356-5"
            className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={lookupByISBN}
            disabled={isbnLooking || !isbnQuery.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isbnLooking
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Looking up…</>
              : <><Search className="h-3.5 w-3.5" />Look up</>}
          </button>
        </div>

        {/* Error state */}
        {isbnError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{isbnError}</span>
          </div>
        )}

        {/* Result card */}
        {isbnResult && !isbnApplied && (
          <div className="rounded-lg bg-white border border-blue-200 p-4 flex gap-4 items-start">
            {isbnResult.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={isbnResult.coverUrl}
                alt={isbnResult.title}
                className="h-24 w-auto rounded shadow-sm object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-24 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-gray-300" />
              </div>
            )}
            <div className="flex-1 space-y-1 min-w-0">
              <p className="font-semibold text-gray-900 leading-snug">{isbnResult.title}</p>
              {isbnResult.subtitle && (
                <p className="text-sm text-gray-500 leading-snug">{isbnResult.subtitle}</p>
              )}
              <p className="text-xs text-gray-400">{isbnResult.previewText}</p>
              {isbnResult.isbn13 && (
                <p className="text-xs text-gray-400">ISBN: {isbnResult.isbn13}</p>
              )}
              {isbnResult.pageCount && (
                <p className="text-xs text-gray-400">{isbnResult.pageCount} pages</p>
              )}
              {isbnResult.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{isbnResult.description.replace(/<[^>]+>/g, "")}</p>
              )}
            </div>
            <button
              type="button"
              onClick={applyIsbnData}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Use this data
            </button>
          </div>
        )}

        {/* Applied confirmation */}
        {isbnApplied && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Book data imported — review and edit the fields below, then save.</span>
          </div>
        )}
      </section>}

      {/* ── Book Details ─────────────────────────────────────────────────────── */}
      {showDetails && <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Book Details</h2>
          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Required field</p>
        </div>

        {/* Title */}
        <div className="space-y-1" data-field-error={fieldErrors.title ? true : undefined}>
          <label className="block text-sm font-medium text-gray-700">Title<Req /></label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" })); }}
            placeholder="e.g. The Silent Deep"
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              fieldErrors.title
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
            } bg-white`}
          />
          <FieldError msg={fieldErrors.title} />
        </div>

        {/* Slug */}
        <div className="space-y-1" data-field-error={fieldErrors.slug ? true : undefined}>
          <label className="block text-sm font-medium text-gray-700">Slug<Req /></label>
          <div className="flex gap-2 items-center">
            <input
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(e.target.value); if (fieldErrors.slug) setFieldErrors((p) => ({ ...p, slug: "" })); }}
              placeholder="the-silent-deep"
              className={`flex-1 block rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
                fieldErrors.slug
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              } bg-white`}
            />
            <button type="button"
              onClick={() => { setSlugManual(false); setSlug(slugify(title)); }}
              className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap px-2">
              Reset
            </button>
          </div>
          <p className="text-xs text-gray-400">Auto-generated from title. Used in your book's web address.</p>
          <FieldError msg={fieldErrors.slug} />
        </div>

        <Input label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g. A Mystery Beneath the Waves" />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Short Description</label>
          <p className="text-xs text-gray-400">1–2 sentence teaser shown on book cards and listings.</p>
          <RichTextEditor
            value={shortDescription}
            onChange={setShortDescription}
            placeholder="1–2 sentence teaser shown on book cards and listings"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Book Overview</label>
          <p className="text-xs text-gray-400">Full book overview shown on the detail page.</p>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Full book overview shown on the detail page"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Caption */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Caption
              <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder='e.g. "New Release!" or "Coming Soon!"'
              maxLength={60}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <p className="text-xs text-gray-400">Short label shown above the title on public pages. Max 60 characters.</p>
          </div>

          {/* Release Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Release Date
              <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <p className="text-xs text-gray-400">Displayed on the public book page.</p>
          </div>
        </div>
      </section>}

      {/* ── Cover ────────────────────────────────────────────────────────────── */}
      {showDetails && <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Cover</h2>

        <CoverUpload value={coverImageUrl} onChange={setCoverImageUrl} />

        <div className="grid grid-cols-3 gap-4">
          <Input label="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)}
            placeholder="978-0-000-00000-0" />
          <Input label="Page Count" type="number" value={pageCount}
            onChange={(e) => setPageCount(e.target.value)} placeholder="e.g. 312" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Retail / Display Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-md border border-gray-300 bg-white pl-6 pr-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <p className="text-xs text-gray-400">Shown on the public book page. Leave blank to hide.</p>
          </div>
        </div>
      </section>}

      {/* ── Organisation ────────────────────────────────────────────────────── */}
      {showOrganisation && <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Organisation</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Series</label>
          <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className={selectClass}>
            <option value="">— No series —</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {genres.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedGenres.includes(g.id)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[var(--accent)]"
                  }`}>
                  {g.parentName ? `${g.parentName} › ${g.name}` : g.name}
                </button>
              ))}
            </div>
            {selectedGenres.length > 0 && (
              <p className="text-xs text-gray-400">{selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""} selected</p>
            )}
          </div>
        )}
      </section>}

      {/* ── Available Formats ────────────────────────────────────────────────── */}
      {showOrganisation && <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Available Formats</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Check every format this book is available in. These appear as badges on the public book page.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { id: "EBOOK",     label: "eBook",      Icon: Tablet     },
              { id: "PAPERBACK", label: "Paperback",  Icon: BookOpen   },
              { id: "HARDBACK",  label: "Hardback",   Icon: BookMarked },
              { id: "AUDIOBOOK", label: "Audiobook",  Icon: Headphones },
            ] as const
          ).map(({ id, label, Icon }) => {
            const checked = availableFormats.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setAvailableFormats((prev) =>
                    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
                  )
                }
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  checked
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${checked ? "text-blue-600" : "text-gray-400"}`} />
                {label}
                {checked && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>}

      {/* ── Visibility & Publishing ──────────────────────────────────────────── */}
      {showOrganisation && <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Visibility & Publishing</h2>

        {/* Published */}
        <div className="flex items-center gap-4 cursor-pointer select-none"
          onClick={() => setIsPublished((v) => !v)}>
          <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${isPublished ? "bg-[var(--accent)]" : "bg-gray-300"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Published</p>
            <p className="text-xs text-gray-400">{isPublished ? "Visible on your public site" : "Hidden — only you can see it"}</p>
          </div>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-4 cursor-pointer select-none"
          onClick={() => setIsFeatured((v) => !v)}>
          <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${isFeatured ? "bg-amber-400" : "bg-gray-300"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Featured on Homepage Hero</p>
            <p className="text-xs text-gray-400">Displays this book in the hero banner. Only one book can be featured — enabling this will automatically unfeature any other.</p>
          </div>
        </div>

        {/* Direct Sales master switch */}
        <div className="flex items-center gap-4 cursor-pointer select-none"
          onClick={() => setDirectSalesEnabled((v) => !v)}>
          <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${directSalesEnabled ? "bg-blue-500" : "bg-gray-300"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${directSalesEnabled ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Enable Direct Sales</p>
            <p className="text-xs text-gray-400">
              Shows buy buttons from the <strong>Direct Sales</strong> section below on your public book pages.
              Requires a Standard or Premium plan with Stripe connected.
            </p>
          </div>
        </div>

        {directSalesEnabled && (
          <div className="ml-14 rounded-lg p-3 text-xs bg-blue-50 border border-blue-100 text-blue-700 space-y-1">
            <p className="font-medium">Next steps to go live:</p>
            <ol className="list-decimal list-inside space-y-0.5 ml-1">
              <li>Add at least one format in the <strong>Direct Sales</strong> tab and set its price</li>
              <li>Make sure your plan has Sales enabled (Standard or Premium)</li>
              <li>Connect Stripe in your platform settings</li>
            </ol>
          </div>
        )}
      </section>}

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
          <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
          <div>
            <p className="font-medium">Unable to save</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}
      {Object.values(fieldErrors).some(Boolean) && !error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Please fix the highlighted fields above before saving.
        </p>
      )}

      <div className="flex items-center justify-between pb-8">
        <Button type="submit" disabled={saving} size="lg">
          {saving
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            : mode === "edit" ? "Save Changes" : "Create Book"}
        </Button>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/books")}>
            Cancel
          </Button>
          {mode === "edit" && (
            <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting}
              className="text-red-600 hover:bg-red-50 border-red-200">
              {deleting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Trash2 className="h-4 w-4 mr-1.5" />Delete Book</>}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
