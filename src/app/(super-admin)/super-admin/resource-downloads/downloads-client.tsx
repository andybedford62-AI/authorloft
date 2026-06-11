"use client";

import { useState, useRef } from "react";
import { Loader2, Plus, Pencil, Trash2, Upload, Link2, X, FileDown, Download, Eye, EyeOff } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Download = {
  id: string; title: string; slug: string; description: string | null;
  body: string | null; category: string; fileUrl: string; coverImageUrl: string | null;
  requiresEmail: boolean; downloadCount: number; isPublished: boolean; displayOrder: number;
};

type CatOption = { name: string; slug: string };

type FormState = {
  title: string; slug: string; description: string; body: string;
  category: string; fileUrl: string; coverImageUrl: string;
  requiresEmail: boolean; isPublished: boolean;
};

const EMPTY: FormState = {
  title: "", slug: "", description: "", body: "",
  category: "", fileUrl: "", coverImageUrl: "",
  requiresEmail: true, isPublished: true,
};

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export function DownloadsClient({ initial, categories }: { initial: Download[]; categories: CatOption[] }) {
  const [rows, setRows]       = useState<Download[]>(initial);
  const [editing, setEditing] = useState<Download | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [coverTab, setCoverTab]     = useState<"upload" | "url">("upload");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverErr, setCoverErr]     = useState<string | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  function openNew() { setForm({ ...EMPTY, category: categories[0]?.slug ?? "" }); setEditing(null); setIsNew(true); setError(null); setCoverTab("upload"); setCoverErr(null); }
  function openEdit(d: Download) {
    setForm({
      title: d.title, slug: d.slug, description: d.description ?? "", body: d.body ?? "",
      category: d.category, fileUrl: d.fileUrl, coverImageUrl: d.coverImageUrl ?? "",
      requiresEmail: d.requiresEmail, isPublished: d.isPublished,
    });
    setEditing(d); setIsNew(false); setError(null); setCoverTab(d.coverImageUrl ? "url" : "upload"); setCoverErr(null);
  }
  function closeForm() { setEditing(null); setIsNew(false); setError(null); setCoverErr(null); }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true); setCoverErr(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res  = await fetch("/api/super-admin/blog/posts/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((p) => ({ ...p, coverImageUrl: data.url }));
    } catch (err: any) {
      setCoverErr(err.message ?? "Upload failed.");
    } finally {
      setCoverUploading(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.title.trim())   { setError("Title is required."); return; }
    if (!form.fileUrl.trim()) { setError("A file URL is required."); return; }
    if (!form.category)       { setError("Pick a category."); return; }
    setSaving(true); setError(null);
    const url    = isNew ? "/api/super-admin/resource-downloads" : `/api/super-admin/resource-downloads/${editing!.id}`;
    const method = isNew ? "POST" : "PUT";
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json   = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Save failed."); return; }
    setRows((prev) => isNew ? [...prev, json] : prev.map((r) => r.id === json.id ? json : r));
    closeForm();
  }

  async function handleDelete(d: Download) {
    if (!confirm(`Delete "${d.title}"? This cannot be undone.`)) return;
    await fetch(`/api/super-admin/resource-downloads/${d.id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== d.id));
  }

  async function togglePublished(d: Download) {
    setTogglingId(d.id);
    const res  = await fetch(`/api/super-admin/resource-downloads/${d.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !d.isPublished }),
    });
    const json = await res.json();
    setTogglingId(null);
    if (res.ok) setRows((prev) => prev.map((r) => r.id === d.id ? json : r));
  }

  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
      <button type="button" role="switch" aria-checked={checked} onClick={onChange} disabled={disabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-purple-600" : "bg-gray-200"}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>
    );
  }

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const showForm = isNew || !!editing;
  const noCategories = categories.length === 0;

  return (
    <div className="space-y-6">
      {noCategories && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          No <strong>resource</strong> categories exist yet. Add some under Content Categories → Resources first.
        </p>
      )}

      <div className="flex justify-end">
        <button onClick={openNew} disabled={noCategories}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add Download
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800">{isNew ? "Add Download" : `Edit — ${editing!.title}`}</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Launch-Week Checklist" /></div>
            <div><label className={labelCls}>Slug <span className="font-normal text-gray-400">— auto if blank</span></label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="launch-week-checklist" /></div>
            <div><label className={labelCls}>Category *</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select></div>
            <div><label className={labelCls}>File URL * <span className="font-normal text-gray-400">— Drive/Dropbox/PDF</span></label>
              <input className={inputCls} value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://drive.google.com/…" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Short description</label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One line shown on the resource card" /></div>

            {/* Cover image */}
            <div className="sm:col-span-2 space-y-2">
              <label className={labelCls}>Cover image <span className="font-normal text-gray-400">— optional</span></label>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                {(["upload", "url"] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => { setCoverTab(tab); setCoverErr(null); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${coverTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    {tab === "upload" ? <><Upload className="h-3 w-3 inline mr-1" />Upload</> : <><Link2 className="h-3 w-3 inline mr-1" />URL</>}
                  </button>
                ))}
              </div>
              {coverTab === "upload" ? (
                <div className="space-y-2">
                  <input ref={coverFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCoverUpload} />
                  <button type="button" onClick={() => coverFileRef.current?.click()} disabled={coverUploading}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50 w-full justify-center">
                    {coverUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Click to upload</>}
                  </button>
                  {coverErr && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{coverErr}</p>}
                </div>
              ) : (
                <input className={inputCls} value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://example.com/cover.png" />
              )}
              {form.coverImageUrl && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit">
                  <img src={form.coverImageUrl} alt="Cover preview" className="h-12 w-12 rounded object-contain border border-gray-200 p-1 bg-white" />
                  <button type="button" onClick={() => setForm({ ...form, coverImageUrl: "" })} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Body (RTE) */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Detail content <span className="font-normal text-gray-400">— optional, shown on the resource&apos;s own page</span></label>
              <RichTextEditor value={form.body} onChange={(html) => setForm({ ...form, body: html })} placeholder="Add a longer description, instructions, or what's inside…" minHeight="160px" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={form.requiresEmail} onChange={() => setForm({ ...form, requiresEmail: !form.requiresEmail })} />
              <div><p className="text-sm font-medium text-gray-700">Require email</p><p className="text-xs text-gray-400">Gate the download behind an email (once per visitor)</p></div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={form.isPublished} onChange={() => setForm({ ...form, isPublished: !form.isPublished })} />
              <div><p className="text-sm font-medium text-gray-700">Published</p><p className="text-xs text-gray-400">Visible on the public resources page</p></div>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save"}
            </button>
            <button onClick={closeForm} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Download</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Downloads</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((d) => {
              const busy = togglingId === d.id;
              return (
                <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${!d.isPublished ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#C26A4A]/10 flex items-center justify-center flex-shrink-0">
                        <FileDown className="h-4 w-4 text-[#C26A4A]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{d.title}</p>
                        <p className="text-xs text-gray-400">{d.requiresEmail ? "Email-gated" : "Open download"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell"><span className="text-xs text-gray-500">{catName(d.category)}</span></td>
                  <td className="px-3 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Download className="h-3 w-3" />{d.downloadCount}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button onClick={() => togglePublished(d)} disabled={busy}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${d.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                      {d.isPublished ? <><Eye className="h-3 w-3" /> Live</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(d)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No downloads yet. Add one above.</div>}
      </div>
    </div>
  );
}
