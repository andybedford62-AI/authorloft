"use client";

import { useState, useRef } from "react";
import { Loader2, Plus, Pencil, Trash2, Star, Globe, Eye, EyeOff, Upload, Link2, X, Check, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Resource = {
  id: string; name: string; category: string; description: string;
  websiteUrl: string; logoUrl: string | null; initials: string;
  avatarColor: string; isPartner: boolean; isActive: boolean;
  showOnHomepage: boolean; displayOrder: number;
};

const EMPTY: Omit<Resource, "id" | "displayOrder"> = {
  name: "", category: "", description: "", websiteUrl: "",
  logoUrl: "", initials: "", avatarColor: "#1B2B47",
  isPartner: false, isActive: true, showOnHomepage: false,
};

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export function ResourcesClient({ initial, categoryOptions = [] }: { initial: Resource[]; categoryOptions?: string[] }) {
  const [resources, setResources] = useState<Resource[]>(initial);
  const [editing, setEditing]     = useState<Resource | null>(null);
  const [isNew,   setIsNew]       = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState<string | null>(null);
  const [form,    setForm]        = useState<Omit<Resource,"id"|"displayOrder">>(EMPTY);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);
  const [reorderingId,  setReorderingId]  = useState<string | null>(null);
  const [logoTab,       setLogoTab]       = useState<"upload" | "url">("upload");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadErr, setLogoUploadErr] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setForm(EMPTY); setEditing(null); setIsNew(true); setError(null);
    setLogoTab("upload"); setLogoUploadErr(null);
  }

  function openEdit(r: Resource) {
    setForm({ name: r.name, category: r.category, description: r.description,
      websiteUrl: r.websiteUrl, logoUrl: r.logoUrl ?? "", initials: r.initials,
      avatarColor: r.avatarColor, isPartner: r.isPartner, isActive: r.isActive,
      showOnHomepage: r.showOnHomepage });
    setEditing(r); setIsNew(false); setError(null);
    setLogoTab(r.logoUrl ? "url" : "upload"); setLogoUploadErr(null);
  }

  function closeForm() { setEditing(null); setIsNew(false); setError(null); setLogoUploadErr(null); }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true); setLogoUploadErr(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/super-admin/blog/posts/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      setLogoUploadErr(err.message ?? "Upload failed. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.websiteUrl.trim()) {
      setError("Name and Website URL are required."); return;
    }
    setSaving(true); setError(null);
    const url    = isNew ? "/api/super-admin/resources" : `/api/super-admin/resources/${editing!.id}`;
    const method = isNew ? "POST" : "PUT";
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, logoUrl: form.logoUrl || null }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Save failed."); return; }
    setResources((prev) =>
      isNew ? [...prev, json] : prev.map((r) => r.id === json.id ? json : r)
    );
    closeForm();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/super-admin/resources/${id}`, { method: "DELETE" });
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  async function move(row: Resource, dir: "up" | "down") {
    const idx = resources.findIndex((r) => r.id === row.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= resources.length) return;
    const next = [...resources];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setReorderingId(row.id);
    const res = await fetch("/api/super-admin/resources/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    });
    const json = await res.json();
    setReorderingId(null);
    if (res.ok) setResources(json);
  }

  async function toggle(id: string, field: "isActive" | "isPartner" | "showOnHomepage", val: boolean) {
    setTogglingId(id);
    const res  = await fetch(`/api/super-admin/resources/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    const json = await res.json();
    setTogglingId(null);
    if (res.ok) setResources((prev) => prev.map((r) => r.id === id ? json : r));
  }

  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
      <button type="button" role="switch" aria-checked={checked} onClick={onChange} disabled={disabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-purple-600" : "bg-gray-200"}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
      </button>
    );
  }

  const showForm = isNew || !!editing;

  return (
    <div className="space-y-6">

      {/* ── Add button ─────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />Add Resource
        </Button>
      </div>

      {/* ── Add/Edit form ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800">{isNew ? "Add Resource" : `Edit — ${editing!.name}`}</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Reedsy" /></div>
            <div><label className={labelCls}>Category</label>
              <input className={inputCls} list="resource-category-options" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Publishing Tools" />
              <datalist id="resource-category-options">
                {Array.from(new Set([...categoryOptions, ...(form.category ? [form.category] : [])])).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Website URL *</label>
              <input className={inputCls} value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://example.com" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Description</label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the resources page" /></div>
            {/* ── Logo — upload or URL ──────────────────────────────── */}
            <div className="sm:col-span-2 space-y-2">
              <label className={labelCls}>Logo <span className="font-normal text-gray-400">— leave blank to show initials avatar</span></label>

              {/* Tab switcher */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                {(["upload", "url"] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => { setLogoTab(tab); setLogoUploadErr(null); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${logoTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    {tab === "upload" ? <><Upload className="h-3 w-3 inline mr-1" />Upload file</> : <><Link2 className="h-3 w-3 inline mr-1" />Paste URL</>}
                  </button>
                ))}
              </div>

              {logoTab === "upload" ? (
                <div className="space-y-2">
                  <input ref={logoFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                  <button type="button" onClick={() => logoFileRef.current?.click()} disabled={logoUploading}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50 w-full justify-center">
                    {logoUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Click to upload logo</>}
                  </button>
                  <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF or SVG · max 8 MB</p>
                  {logoUploadErr && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{logoUploadErr}</p>}
                </div>
              ) : (
                <div>
                  <input className={inputCls} value={form.logoUrl ?? ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
                  <p className="text-xs text-gray-400 mt-1">Paste any publicly accessible image URL</p>
                </div>
              )}

              {/* Preview + clear */}
              {form.logoUrl && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit">
                  <img src={form.logoUrl} alt="Logo preview" className="h-10 w-10 rounded object-contain border border-gray-200 p-1 bg-white" />
                  <div className="text-xs text-gray-500 max-w-xs truncate">{form.logoUrl}</div>
                  <button type="button" onClick={() => setForm({ ...form, logoUrl: "" })} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div><label className={labelCls}>Initials <span className="font-normal text-gray-400">fallback (2–4 chars)</span></label>
              <input className={inputCls} value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value.slice(0,4) })} placeholder="e.g. Re" maxLength={4} /></div>
            <div><label className={labelCls}>Avatar Colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.avatarColor} onChange={(e) => setForm({ ...form, avatarColor: e.target.value })} className="h-9 w-14 cursor-pointer rounded border border-gray-200 p-0.5" />
                <input className={inputCls} value={form.avatarColor} onChange={(e) => setForm({ ...form, avatarColor: e.target.value })} placeholder="#1B2B47" />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            {([
              { field: "isActive"       as const, label: "Active",             desc: "Show on resources page" },
              { field: "isPartner"      as const, label: "Featured Partner",   desc: "Confirmed cross-promotion" },
              { field: "showOnHomepage" as const, label: "Show on Homepage",   desc: "Appears in homepage strip" },
            ] as const).map(({ field, label, desc }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <Toggle checked={form[field]} onChange={() => setForm({ ...form, [field]: !form[field] })} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
            </Button>
            <Button variant="ghost" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Resources table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Order</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Resource</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Partner</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Homepage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {resources.map((r, i, arr) => {
              const busy = togglingId === r.id;
              const moving = reorderingId === r.id;
              return (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.isActive ? "opacity-50" : ""}`}>
                  {/* Order arrows */}
                  <td className="px-2 py-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <button onClick={() => move(r, "up")} disabled={moving || i === 0}
                        className="p-0.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => move(r, "down")} disabled={moving || i === arr.length - 1}
                        className="p-0.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  {/* Name + url */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: r.avatarColor }}>
                        {r.logoUrl
                          ? <img src={r.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain p-0.5" />
                          : r.initials || r.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1">
                          <Globe className="h-3 w-3" />{r.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{r.category || "—"}</span>
                  </td>
                  {/* Active toggle */}
                  <td className="px-3 py-4 text-center">
                    <Toggle checked={r.isActive} disabled={busy} onChange={() => toggle(r.id, "isActive", !r.isActive)} />
                  </td>
                  {/* Partner toggle */}
                  <td className="px-3 py-4 text-center">
                    <button onClick={() => toggle(r.id, "isPartner", !r.isPartner)} disabled={busy}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${r.isPartner ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                      <Star className={`h-3 w-3 ${r.isPartner ? "fill-amber-500" : ""}`} />
                      {r.isPartner ? "Yes" : "No"}
                    </button>
                  </td>
                  {/* Homepage toggle */}
                  <td className="px-3 py-4 text-center">
                    <button onClick={() => toggle(r.id, "showOnHomepage", !r.showOnHomepage)} disabled={busy}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${r.showOnHomepage ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                      {r.showOnHomepage ? <><Eye className="h-3 w-3" /> Shown</> : <><EyeOff className="h-3 w-3" /> Hidden</>}
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {resources.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No resources yet. Add one above.</div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-blue-500" /> Shown on homepage strip</span>
        <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Featured partner badge</span>
        <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-gray-400" /> Hidden from public pages</span>
      </div>
    </div>
  );
}
