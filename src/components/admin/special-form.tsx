"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2, Tag, ExternalLink, Calendar, Clock } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export interface SpecialData {
  id?: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsAt: string | null;  // ISO date string or YYYY-MM-DD
  endsAt: string | null;
  isActive: boolean;
}

interface SpecialFormProps {
  initial?: Partial<SpecialData>;
  mode: "create" | "edit";
}

function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  // Handle both ISO strings and date-only strings
  return val.slice(0, 10);
}

export function SpecialForm({ initial, mode }: SpecialFormProps) {
  const router = useRouter();

  const [title, setTitle]           = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl]     = useState(initial?.imageUrl ?? "");
  const [ctaLabel, setCtaLabel]     = useState(initial?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl]         = useState(initial?.ctaUrl ?? "");
  const [startsAt, setStartsAt]     = useState(toDateInput(initial?.startsAt));
  const [endsAt, setEndsAt]         = useState(toDateInput(initial?.endsAt));
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);

  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Expiry preview ──────────────────────────────────────────────────────────
  const now = new Date();
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  const daysLeft = endsAtDate
    ? Math.ceil((endsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpired = endsAtDate ? endsAtDate <= now : false;

  // ── Image upload ────────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/special-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      setError("End date must be after start date.");
      return;
    }

    setSaving(true);
    try {
      const payload: Omit<SpecialData, "id"> = {
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        ctaLabel: ctaLabel.trim() || null,
        ctaUrl: ctaUrl.trim() || null,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        isActive,
      };

      const url = mode === "create"
        ? "/api/admin/specials"
        : `/api/admin/specials/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/admin/specials");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("Permanently delete this special? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/specials/${initial?.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      router.push("/admin/specials");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Details</h2>
        </div>

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
            placeholder="e.g. Signed Hardcover — Limited Run, Summer Sale 40% Off"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Tell readers what this special offer includes, why it's valuable, and how to take advantage of it…"
          />
        </div>
      </section>

      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Promotional Image</h2>
        <p className="text-sm text-gray-500">
          Displayed at the top of the special card. JPG, PNG, or WebP — max 5 MB.
          If no image is set, the card will show a colored accent bar instead.
        </p>

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative w-full max-w-sm h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={imageUrl} alt="Special image" fill className="object-cover" unoptimized />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800"
              >
                <X className="h-3.5 w-3.5" /> Remove image
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
              >
                <Upload className="h-3.5 w-3.5" /> Replace
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {imageUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload image</>
              )}
            </button>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Or paste an image URL</label>
              <input
                type="url"
                placeholder="https://example.com/promo-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Call to Action ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Call to Action</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Optional button shown at the bottom of the card. Leave blank for an info-only card.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="e.g. Get This Deal, Order Now, Learn More"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Defaults to "Get This Deal" if blank</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ── Date Range ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Availability Window</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Leave both blank for an evergreen special with no expiry. The public page automatically
          hides expired specials.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank to show immediately</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              min={startsAt || undefined}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank for no expiry</p>
          </div>
        </div>

        {/* Expiry preview */}
        {endsAt && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${
            isExpired
              ? "bg-red-50 text-red-700 border border-red-200"
              : daysLeft !== null && daysLeft <= 7
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            <Clock className="h-4 w-4 flex-shrink-0" />
            {isExpired
              ? "This special has already expired and will not appear publicly."
              : daysLeft === 0
              ? "Ends today — readers will see an urgency badge."
              : daysLeft === 1
              ? "Ends tomorrow — readers will see an urgency badge."
              : daysLeft !== null && daysLeft <= 7
              ? `${daysLeft} days remaining — readers will see a countdown badge.`
              : `Ends ${new Date(endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
            }
          </div>
        )}
      </section>

      {/* ── Visibility ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Visibility</h2>
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
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isActive ? "Active — visible on public site" : "Hidden from public site"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isActive
                ? "Readers can see this special (subject to date range above)"
                : "Only you can see this — toggle on when ready to publish"}
            </p>
          </div>
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
            {mode === "create" ? "Create Special" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/specials")}
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
            Delete Special
          </button>
        )}
      </div>
    </form>
  );
}
