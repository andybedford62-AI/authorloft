"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Eye, EyeOff, ExternalLink, Loader2, BookOpen } from "lucide-react";

export interface FlipBookData {
  id?: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  slug: string;
  flipBookUrl: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FlipBookFormProps {
  initial?: Partial<FlipBookData>;
  mode: "create" | "edit";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function FlipBookForm({ initial, mode }: FlipBookFormProps) {
  const router = useRouter();

  const [title, setTitle]               = useState(initial?.title ?? "");
  const [subtitle, setSubtitle]         = useState(initial?.subtitle ?? "");
  const [description, setDescription]   = useState(initial?.description ?? "");
  const [slug, setSlug]                 = useState(initial?.slug ?? "");
  const [flipBookUrl, setFlipBookUrl]   = useState(initial?.flipBookUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [coverImageKey, setCoverImageKey] = useState(initial?.coverImageKey ?? "");
  const [isActive, setIsActive]         = useState(initial?.isActive ?? true);
  const [sortOrder, setSortOrder]       = useState(initial?.sortOrder ?? 0);

  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [showPreview, setShowPreview]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title during creation
  useEffect(() => {
    if (autoSlug && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, autoSlug, mode]);

  // ── Cover upload ────────────────────────────────────────────────────────────
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/flip-book-cover", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setCoverImageUrl(data.url);
      setCoverImageKey(data.fileKey ?? "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCoverUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeCover() {
    setCoverImageUrl("");
    setCoverImageKey("");
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: FlipBookData = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        slug: slug.trim(),
        flipBookUrl: flipBookUrl.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        coverImageKey: coverImageKey.trim() || null,
        isActive,
        sortOrder,
      };

      const url = mode === "create"
        ? "/api/admin/flip-books"
        : `/api/admin/flip-books/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/admin/flip-books");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("Permanently delete this flip book? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/flip-books/${initial?.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      router.push("/admin/flip-books");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  const previewUrlValid = flipBookUrl.startsWith("http");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Basic Information</h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. My Amazing Book — Interactive Edition"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Optional short subtitle"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what readers will find in this flip book…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(slugify(e.target.value));
              }}
              required
              placeholder="my-flip-book"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {mode === "create" && (
              <button
                type="button"
                onClick={() => { setAutoSlug(true); setSlug(slugify(title)); }}
                className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
              >
                Auto-generate
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Public URL: <span className="font-mono">/flip-books/{slug || "…"}</span>
          </p>
        </div>
      </section>

      {/* ── Flip Book URL ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-base">Embed URL</h2>
        <p className="text-sm text-gray-500">
          Paste the embed URL from FlipHTML5, Issuu, Flipsnack, or any other flip book service.
          This URL will be displayed in a full-screen iframe on your public page.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Flip Book Embed URL</label>
          <input
            type="url"
            value={flipBookUrl}
            onChange={(e) => setFlipBookUrl(e.target.value)}
            placeholder="https://online.fliphtml5.com/…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Live preview toggle */}
        {previewUrlValid && (
          <div>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Hide preview" : "Show live preview"}
            </button>
            {showPreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-80">
                <iframe
                  src={flipBookUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Flip book preview"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Cover Image ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-base">Cover Image</h2>
        <p className="text-sm text-gray-500">
          Displayed on the public flip books listing page. JPG, PNG, or WebP, max 5 MB.
        </p>

        {coverImageUrl ? (
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-44 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <Image src={coverImageUrl} alt="Cover" fill className="object-cover" unoptimized />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 break-all font-mono text-xs">{coverImageUrl}</p>
              <button
                type="button"
                onClick={removeCover}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <X className="h-3.5 w-3.5" /> Remove cover
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {coverUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload cover image</>
              )}
            </button>
          </div>
        )}

        {/* Or enter URL directly */}
        {!coverImageUrl && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Or paste a cover image URL</label>
            <input
              type="url"
              placeholder="https://example.com/cover.jpg"
              value=""
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) { setCoverImageUrl(url); setCoverImageKey(""); }
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </section>

      {/* ── Visibility & Order ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-base">Visibility & Order</h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">
            {isActive ? "Visible on public site" : "Hidden from public site"}
          </span>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
        </div>
      </section>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Flip Book" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/flip-books")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg border border-gray-300 hover:border-gray-400"
          >
            Cancel
          </button>
        </div>

        {mode === "edit" && initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Flip Book
          </button>
        )}
      </div>
    </form>
  );
}
