"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Link, Check, Loader2, X, ImageIcon, RefreshCw } from "lucide-react";

type SeoPage = {
  id: string;
  label: string;
  path: string;
  ogImageUrl: string | null;
};

function PageImageEditor({ page, onSaved }: { page: SeoPage; onSaved: (id: string, url: string | null) => void }) {
  const [tab,     setTab]     = useState<"upload" | "url">("upload");
  const [url,     setUrl]     = useState(page.ogImageUrl ?? "");
  const [preview, setPreview] = useState(page.ogImageUrl ?? "");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setSaving(true); setError(""); setSuccess(false);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch(`/api/super-admin/seo/${page.id}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
      setPreview(data.url); setUrl(data.url); setSuccess(true);
      onSaved(page.id, data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally { setSaving(false); }
  }

  async function handleSaveUrl() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res  = await fetch(`/api/super-admin/seo/${page.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setPreview(url); setSuccess(true);
      onSaved(page.id, url || null);
    } catch {
      setError("Save failed.");
    } finally { setSaving(false); }
  }

  async function handleClear() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      await fetch(`/api/super-admin/seo/${page.id}`, { method: "DELETE" });
      setUrl(""); setPreview(""); setSuccess(true);
      onSaved(page.id, null);
    } catch {
      setError("Failed to clear image.");
    } finally { setSaving(false); }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{page.label}</p>
          <p className="text-xs text-gray-400 font-mono">{page.path}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${preview ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {preview ? "Custom image" : "Default"}
        </span>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-gray-100 overflow-hidden bg-gray-50 h-32">
        {preview ? (
          <div className="relative h-full">
            <img src={preview} alt={`OG preview for ${page.label}`} className="w-full h-full object-cover" />
            <button
              onClick={handleClear}
              disabled={saving}
              className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              title="Remove — revert to default"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1 text-gray-400">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Using default image</span>
          </div>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
        {(["upload", "url"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
              tab === t ? "bg-purple-600 text-white font-medium" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === "upload" ? <><Upload className="h-3 w-3" /> Upload</> : <><Link className="h-3 w-3" /> Paste URL</>}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg text-xs text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {saving ? "Uploading…" : "Click to upload (JPG, PNG, WebP)"}
          </button>
          <p className="text-xs text-center text-gray-400">Recommended: 1200 × 630px</p>
        </>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleSaveUrl}
            disabled={saving || !url}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </button>
        </div>
      )}

      {success && (
        <p className="flex items-center gap-1.5 text-xs text-green-600">
          <Check className="h-3.5 w-3.5" /> Saved — page will show new image within 60 seconds.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SeoPanel() {
  const [pages,   setPages]   = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/super-admin/seo");
    const data = await res.json();
    setPages(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSaved(id: string, url: string | null) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ogImageUrl: url } : p));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            Social Preview Images
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Set a custom OG image for each marketing page. Shown when shared on Facebook, Twitter/X, LinkedIn, etc. Recommended: 1200×630px.
          </p>
        </div>
        <button onClick={load} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map(page => (
            <PageImageEditor key={page.id} page={page} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
