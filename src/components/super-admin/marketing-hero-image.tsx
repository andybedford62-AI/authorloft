"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Upload, Link, Check, Loader2, X } from "lucide-react";

export function MarketingHeroImage({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl]           = useState(initialUrl ?? "");
  const [preview, setPreview]   = useState(initialUrl ?? "");
  const [tab, setTab]           = useState<"upload" | "url">("upload");
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const fileRef                 = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setSaving(true); setError(""); setSuccess(false);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/super-admin/marketing/hero-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
      setPreview(data.url);
      setUrl(data.url);
      setSuccess(true);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUrl() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res  = await fetch("/api/super-admin/marketing/hero-image", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setPreview(url);
      setSuccess(true);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      await fetch("/api/super-admin/marketing/hero-image", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: "" }),
      });
      setUrl(""); setPreview(""); setSuccess(true);
    } catch {
      setError("Failed to clear image.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Current preview */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Marketing hero preview"
              className="w-full h-48 object-cover object-top"
            />
            <button
              onClick={handleClear}
              disabled={saving}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              title="Remove image (revert to default)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">Using default image</span>
          </div>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
              tab === t ? "bg-purple-600 text-white font-medium" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === "upload" ? <><Upload className="h-3.5 w-3.5" /> Upload file</> : <><Link className="h-3.5 w-3.5" /> Paste URL</>}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-xl text-sm text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {saving ? "Uploading…" : "Click to choose image (JPG, PNG, WebP)"}
          </button>
          <p className="mt-2 text-center text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Recommended size: <strong>1092 × 1404 px</strong> — PNG or WebP for best quality
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleSaveUrl}
            disabled={saving || !url}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        </div>
      )}

      {success && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="h-4 w-4" /> Saved — marketing page will show the new image.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-gray-400">
        Clearing the image reverts to the default screenshot.
      </p>
    </div>
  );
}
