"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Loader2, Trash2, ToggleLeft, ToggleRight, BookOpen, Film, Package, Headphones,
  Upload, FileText, X, CheckCircle, Lock, Zap,
} from "lucide-react";

// ── Format config ─────────────────────────────────────────────────────────────

type FormatKey = "EBOOK" | "AUDIO" | "FLIPBOOK" | "PRINT";

const FORMATS: Record<FormatKey, {
  label: string;
  description: string;
  defaultLabel: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  needsFile: boolean;
  fileAccept: string;
  fileHint: string;
}> = {
  EBOOK: {
    label: "eBook",
    description: "Digital download (PDF, ePub, MOBI)",
    defaultLabel: "eBook",
    icon: <BookOpen className="h-4 w-4" />,
    color: "#2563eb",
    bg: "#eff6ff",
    needsFile: true,
    fileAccept: ".pdf,.epub,.mobi",
    fileHint: "PDF / ePub / MOBI",
  },
  AUDIO: {
    label: "Audio Book",
    description: "Downloadable audio file (MP3, M4B)",
    defaultLabel: "Audio Book",
    icon: <Headphones className="h-4 w-4" />,
    color: "#d97706",
    bg: "#fffbeb",
    needsFile: true,
    fileAccept: ".mp3,.m4b,.m4a",
    fileHint: "MP3 / M4B / M4A",
  },
  FLIPBOOK: {
    label: "Flip Book",
    description: "Interactive online flip-book edition",
    defaultLabel: "Flip Book",
    icon: <Film className="h-4 w-4" />,
    color: "#7c3aed",
    bg: "#f5f3ff",
    needsFile: true,
    fileAccept: ".pdf,.epub,.mobi",
    fileHint: "PDF / ePub / MOBI",
  },
  PRINT: {
    label: "Print / Physical",
    description: "Paperback or hardcover",
    defaultLabel: "Paperback",
    icon: <Package className="h-4 w-4" />,
    color: "#059669",
    bg: "#ecfdf5",
    needsFile: false,
    fileAccept: "",
    fileHint: "",
  },
};

const FORMAT_KEYS = Object.keys(FORMATS) as FormatKey[];

// ── Types ─────────────────────────────────────────────────────────────────────

type DirectSaleItem = {
  id: string;
  format: FormatKey;
  label: string;
  description: string | null;
  priceCents: number;
  isActive: boolean;
  sortOrder: number;
  fileUrl: string | null;
  fileKey: string | null;
  fileName: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function dollarsTocents(dollars: string): number {
  const parsed = parseFloat(dollars.replace(/[^0-9.]/g, ""));
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ── File Upload widget (per item) ─────────────────────────────────────────────

function FileUploadWidget({
  item,
  bookId,
  onUpdated,
  fileAccept,
  fileHint,
}: {
  item: DirectSaleItem;
  bookId: string;
  onUpdated: (updated: DirectSaleItem) => void;
  fileAccept: string;
  fileHint: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      // Step 1 — get a signed upload URL from our API (tiny request, no file data)
      const urlRes = await fetch("/api/admin/upload/book-file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, fileName: file.name }),
      });

      if (!urlRes.ok) {
        const data = await urlRes.json().catch(() => ({}));
        setUploadError(data.error || "Could not start upload. Please try again.");
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const { signedUrl, fileKey } = await urlRes.json();

      // Step 2 — upload file directly from browser to Supabase (bypasses Vercel size limit)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => uploadRes.statusText);
        setUploadError(`Upload failed (${uploadRes.status}): ${text}`);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Step 3 — tell our API the upload is done so it can record fileKey in DB
      const completeRes = await fetch("/api/admin/upload/book-file-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, fileKey, fileName: file.name }),
      });

      if (!completeRes.ok) {
        const data = await completeRes.json().catch(() => ({}));
        setUploadError(data.error || "File uploaded but could not save. Please try again.");
      } else {
        onUpdated({ ...item, fileUrl: fileKey, fileKey, fileName: file.name });
      }
    } catch (err: any) {
      setUploadError(err?.message ?? "Unexpected error. Please try again.");
    }

    setUploading(false);
    // Reset input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemoveFile() {
    if (!confirm("Remove the uploaded file? Buyers will no longer be able to download it.")) return;
    setRemoving(true);
    const res = await fetch(`/api/admin/books/${bookId}/direct-sales/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearFile: true }),
    });
    if (res.ok) {
      onUpdated({ ...item, fileUrl: null, fileKey: null, fileName: null });
    }
    setRemoving(false);
  }

  const hasFile = !!item.fileKey;

  return (
    <div className="mt-2 pl-12">
      {hasFile ? (
        /* ── File attached ─────────────────────────────────────────────────── */
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs">
            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium truncate max-w-[200px]" title={item.fileName ?? undefined}>
              {item.fileName ?? "File uploaded"}
            </span>
          </div>
          <label className="relative cursor-pointer">
            <span className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {uploading ? "Uploading…" : "Replace"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={fileAccept}
              className="sr-only"
              disabled={uploading || removing}
              onChange={handleFileChange}
            />
          </label>
          <button
            type="button"
            disabled={removing || uploading}
            onClick={handleRemoveFile}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            Remove
          </button>
        </div>
      ) : (
        /* ── No file yet ───────────────────────────────────────────────────── */
        <label className="relative cursor-pointer inline-flex">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors
            ${uploading
              ? "border-blue-200 bg-blue-50 text-blue-600"
              : "border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            {uploading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
            ) : (
              <><FileText className="h-3.5 w-3.5" /> Upload file ({fileHint})</>
            )}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            className="sr-only"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      )}
      {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DirectSalesItems({
  bookId,
  salesEnabled,
  stripeConnectOnboarded,
}: {
  bookId: string;
  salesEnabled: boolean;
  stripeConnectOnboarded: boolean;
}) {
  const [items, setItems] = useState<DirectSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add-form state
  const [adding, setAdding] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>("EBOOK");
  const [customLabel, setCustomLabel] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("0.00");
  const [addError, setAddError] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("0.00");
  const [editSaving, setEditSaving] = useState(false);

  // Per-item pending state (toggle / delete)
  const [pending, setPending] = useState<Record<string, boolean>>({});

  // Stripe Connect
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState("");

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/admin/books/${bookId}/direct-sales`)
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Could not load direct sale items."); setLoading(false); });
  }, [bookId]);

  // ── Add ────────────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    const priceCents = dollarsTocents(priceInput);
    const label = customLabel.trim() || FORMATS[selectedFormat].defaultLabel;

    setSaving(true);
    const res = await fetch(`/api/admin/books/${bookId}/direct-sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format: selectedFormat,
        label,
        description: description.trim() || undefined,
        priceCents,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAddError(data.error || "Could not add item.");
    } else {
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setCustomLabel("");
      setDescription("");
      setPriceInput("0.00");
      setAdding(false);
    }
    setSaving(false);
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  async function toggleActive(item: DirectSaleItem) {
    setPending((p) => ({ ...p, [item.id]: true }));
    const res = await fetch(`/api/admin/books/${bookId}/direct-sales/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
    setPending((p) => ({ ...p, [item.id]: false }));
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deleteItem(id: string, label: string) {
    if (!confirm(`Remove "${label}"? This cannot be undone.`)) return;
    setPending((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/admin/books/${bookId}/direct-sales/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    setPending((p) => ({ ...p, [id]: false }));
  }

  // ── Start edit ─────────────────────────────────────────────────────────────
  function startEdit(item: DirectSaleItem) {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditDesc(item.description ?? "");
    setEditPrice(centsToDollars(item.priceCents));
  }

  // ── Save edit ──────────────────────────────────────────────────────────────
  async function saveEdit(item: DirectSaleItem) {
    setEditSaving(true);
    const res = await fetch(`/api/admin/books/${bookId}/direct-sales/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: editLabel.trim() || FORMATS[item.format].defaultLabel,
        description: editDesc.trim() || null,
        priceCents: dollarsTocents(editPrice),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditingId(null);
    }
    setEditSaving(false);
  }

  // ── Connect Stripe ────────────────────────────────────────────────────────
  async function handleConnect() {
    setConnectError("");
    setConnectLoading(true);
    try {
      const res = await fetch("/api/admin/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setConnectError(data.error || "Could not start Stripe setup. Please try again.");
        setConnectLoading(false);
      }
    } catch {
      setConnectError("Could not start Stripe setup. Please try again.");
      setConnectLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!salesEnabled) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Direct Sales</h2>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Direct Sales requires a paid plan</p>
            <p className="text-amber-700 mt-0.5">
              Upgrade your plan to offer direct book sales to readers.{" "}
              <a href="/admin/settings/billing" className="underline font-medium">
                View plans
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!stripeConnectOnboarded) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Direct Sales</h2>
        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-violet-900">Connect your Stripe account to start selling</p>
            <p className="text-violet-700 mt-1">
              Readers pay you directly — payments land in your own Stripe account instantly.
              AuthorLoft retains a <strong>10% platform fee</strong> per sale; you keep the rest.
              Setup takes about 2 minutes.
            </p>
            {connectError && <p className="text-red-600 mt-2 text-xs">{connectError}</p>}
            <button
              type="button"
              onClick={handleConnect}
              disabled={connectLoading}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {connectLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
              ) : (
                <><Zap className="h-4 w-4" /> Connect Stripe</>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Direct Sales</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Offer different editions directly to readers — eBook, Audio Book, Flip Book, or Print.
            Each can have its own price and be activated or deactivated independently.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Format
          </button>
        )}
      </div>

      {/* ── Info panel ──────────────────────────────────────────────────────── */}
      {items.length === 0 && !loading && !adding && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 space-y-1">
          <p className="font-medium">How direct sales work</p>
          <p className="text-blue-600">
            Add one or more formats (eBook, Flip Book, Print). Each format shows its own buy
            button on your public book page. For digital formats, upload your file here —
            buyers receive a secure download link after payment.
          </p>
          <p className="text-blue-600 mt-1">
            Payments go directly to your connected Stripe account. AuthorLoft retains a{" "}
            <strong>10% platform fee</strong> per sale.
          </p>
          <p className="text-blue-600 font-medium mt-1">
            Make sure <em>Direct Sales</em> is enabled in the Book Details section above.
          </p>
        </div>
      )}

      {/* ── Add form ────────────────────────────────────────────────────────── */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4"
        >
          <p className="text-sm font-medium text-gray-700">Add a format for direct sale</p>

          {/* Format picker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FORMAT_KEYS.map((key) => {
              const fmt = FORMATS[key];
              const active = selectedFormat === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedFormat(key);
                    setCustomLabel("");
                  }}
                  style={active ? { borderColor: fmt.color, backgroundColor: fmt.bg, color: fmt.color } : {}}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors
                    ${active
                      ? "shadow-sm"
                      : "border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <span style={active ? { color: fmt.color } : { color: "#6b7280" }}>
                    {fmt.icon}
                  </span>
                  <span className="text-xs font-semibold">{fmt.label}</span>
                  <span className="text-[10px] leading-tight text-gray-400">{fmt.description}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Label */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Button label{" "}
                <span className="text-gray-400 font-normal">
                  (optional — defaults to "{FORMATS[selectedFormat].defaultLabel}")
                </span>
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={FORMATS[selectedFormat].defaultLabel}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Short note{" "}
              <span className="text-gray-400 font-normal">
                (optional — shown to buyers, e.g. "DRM-free PDF + ePub")
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. DRM-free · PDF + ePub included"
              maxLength={120}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {FORMATS[selectedFormat].needsFile && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded px-3 py-2">
              After adding this format, upload your {FORMATS[selectedFormat].fileHint} file so buyers can download it after payment.
            </p>
          )}

          {addError && <p className="text-xs text-red-600">{addError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {saving ? "Adding…" : "Add Format"}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setAddError(""); setCustomLabel(""); setDescription(""); setPriceInput("0.00"); }}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Item list ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : items.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {items.map((item) => {
            const fmt = FORMATS[item.format] ?? FORMATS.EBOOK;
            const isBusy = pending[item.id];
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                {isEditing ? (
                  /* ── Inline edit form ───────────────────────────────────── */
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-gray-600">Button label</label>
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder={fmt.defaultLabel}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Price (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Short note (optional)</label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="e.g. DRM-free · PDF + ePub included"
                        maxLength={120}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(item)}
                        disabled={editSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        {editSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Row ────────────────────────────────────────────────── */
                  <>
                    <div className="flex items-center gap-3">
                      {/* Format icon */}
                      <div
                        className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: fmt.bg, color: fmt.color }}
                        title={fmt.label}
                      >
                        {fmt.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: fmt.bg, color: fmt.color }}
                          >
                            {fmt.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            ${centsToDollars(item.priceCents)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span
                        className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Edit */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => startEdit(item)}
                          className="px-2 py-1 rounded text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => toggleActive(item)}
                          title={item.isActive ? "Deactivate (hides from public site)" : "Activate"}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors disabled:opacity-50 ${
                            item.isActive
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {isBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : item.isActive ? (
                            <><ToggleRight className="h-3.5 w-3.5" />Deactivate</>
                          ) : (
                            <><ToggleLeft className="h-3.5 w-3.5" />Activate</>
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => deleteItem(item.id, item.label)}
                          title="Delete"
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ── File upload (only for digital formats) ─────────── */}
                    {fmt.needsFile && (
                      <FileUploadWidget
                        item={item}
                        bookId={bookId}
                        fileAccept={fmt.fileAccept}
                        fileHint={fmt.fileHint}
                        onUpdated={(updated) =>
                          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
                        }
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
