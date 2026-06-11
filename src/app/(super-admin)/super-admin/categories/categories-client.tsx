"use client";

import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

type Category = {
  id: string; type: string; name: string; slug: string;
  description: string | null; sortOrder: number; isActive: boolean;
};

type CatType = "blog" | "resource" | "faq";
const TYPES: { key: CatType; label: string; hint: string }[] = [
  { key: "blog",     label: "Blog",      hint: "Topics for blog & news posts" },
  { key: "resource", label: "Resources", hint: "Sections for downloadable resources" },
  { key: "faq",      label: "FAQ",       hint: "Groups for the public FAQ page" },
];

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

type FormState = { name: string; slug: string; description: string; isActive: boolean };
const EMPTY: FormState = { name: "", slug: "", description: "", isActive: true };

export function CategoriesClient({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [activeType, setActiveType] = useState<CatType>("blog");
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const visible = categories
    .filter((c) => c.type === activeType)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  function openNew() { setForm(EMPTY); setEditing(null); setIsNew(true); setError(null); }
  function openEdit(c: Category) {
    setForm({ name: c.name, slug: c.slug, description: c.description ?? "", isActive: c.isActive });
    setEditing(c); setIsNew(false); setError(null);
  }
  function closeForm() { setEditing(null); setIsNew(false); setError(null); }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    const url    = isNew ? "/api/super-admin/categories" : `/api/super-admin/categories/${editing!.id}`;
    const method = isNew ? "POST" : "PUT";
    const body   = isNew ? { ...form, type: activeType } : form;
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Save failed."); return; }
    setCategories((prev) => isNew ? [...prev, json] : prev.map((c) => c.id === json.id ? json : c));
    closeForm();
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Delete the "${c.name}" category? Existing content keeps its current category label, but it will no longer appear in dropdowns.`)) return;
    await fetch(`/api/super-admin/categories/${c.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function toggleActive(c: Category) {
    setTogglingId(c.id);
    const res  = await fetch(`/api/super-admin/categories/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    const json = await res.json();
    setTogglingId(null);
    if (res.ok) setCategories((prev) => prev.map((x) => x.id === c.id ? json : x));
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
  const activeMeta = TYPES.find((t) => t.key === activeType)!;

  return (
    <div className="space-y-6">
      {/* Type tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {TYPES.map((t) => (
          <button key={t.key} type="button"
            onClick={() => { setActiveType(t.key); closeForm(); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeType === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
            <span className="ml-1.5 text-xs text-gray-400">
              {categories.filter((c) => c.type === t.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{activeMeta.hint}</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
          <Plus className="h-4 w-4" /> Add {activeMeta.label} Category
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800">
            {isNew ? `Add ${activeMeta.label} Category` : `Edit — ${editing!.name}`}
          </h2>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Email Marketing" /></div>
            <div><label className={labelCls}>Slug <span className="font-normal text-gray-400">— auto-generated if blank</span></label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="email-marketing" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Description <span className="font-normal text-gray-400">— optional</span></label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description (shown on some public pages)" /></div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle checked={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Available in dropdowns and shown on public pages</p>
            </div>
          </label>

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
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Slug</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map((c) => {
              const busy = togglingId === c.id;
              return (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!c.isActive ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <code className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{c.slug}</code>
                  </td>
                  <td className="px-3 py-4 text-center text-xs text-gray-500">{c.sortOrder}</td>
                  <td className="px-3 py-4 text-center">
                    <Toggle checked={c.isActive} disabled={busy} onChange={() => toggleActive(c)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No {activeMeta.label.toLowerCase()} categories yet. Add one above.</div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Tip: lower <strong>Order</strong> numbers appear first. Set a category to inactive to hide it without deleting existing content.
      </p>
    </div>
  );
}
