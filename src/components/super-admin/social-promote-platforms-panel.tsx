"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Share2, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = {
  id: string;
  slug: string;
  name: string;
  maxChars: number;
  hashtagStyle: string;
  promptAddendum: string | null;
  isPremiumOnly: boolean;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  slug: string;
  name: string;
  maxChars: string;
  hashtagStyle: string;
  promptAddendum: string;
  isPremiumOnly: boolean;
  sortOrder: string;
};

const emptyForm: FormState = {
  slug: "", name: "", maxChars: "2000", hashtagStyle: "trailing",
  promptAddendum: "", isPremiumOnly: false, sortOrder: "0",
};

function PlatformModal({
  title, form, setForm, onSave, onClose, saving, slugLocked, error,
}: {
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  slugLocked: boolean;
  error: string | null;
}) {
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name <span className="text-red-500">*</span></label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Threads"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Slug <span className="text-red-500">*</span></label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. threads"
                disabled={slugLocked}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">{slugLocked ? "Slug cannot be changed after creation." : "Lowercase, hyphens only."}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Max characters <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.maxChars}
                onChange={(e) => setForm({ ...form, maxChars: e.target.value })}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Hard cap shown to authors and enforced at generation.</p>
            </div>
            <div>
              <label className={labelCls}>Hashtag style</label>
              <select
                value={form.hashtagStyle}
                onChange={(e) => setForm({ ...form, hashtagStyle: e.target.value })}
                className={inputCls}
              >
                <option value="trailing">Trailing (end of post)</option>
                <option value="inline">Inline (in body)</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Prompt addendum</label>
            <textarea
              value={form.promptAddendum}
              onChange={(e) => setForm({ ...form, promptAddendum: e.target.value })}
              placeholder="Platform-specific instructions appended to the AI prompt…"
              rows={3}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Appended to every generation for this platform. Keep concise.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sort order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPremiumOnly}
                  onChange={(e) => setForm({ ...form, isPremiumOnly: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Premium plan only</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.name.trim() || !form.slug.trim() || !form.maxChars}
          >
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SocialPromotePlatformsPanel({ initialPlatforms }: { initialPlatforms: Platform[] }) {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openAdd() {
    setForm({ ...emptyForm, sortOrder: platforms.length.toString() });
    setError(null);
    setModal("add");
  }

  function openEdit(p: Platform) {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      name: p.name,
      maxChars: p.maxChars.toString(),
      hashtagStyle: p.hashtagStyle,
      promptAddendum: p.promptAddendum ?? "",
      isPremiumOnly: p.isPremiumOnly,
      sortOrder: p.sortOrder.toString(),
    });
    setError(null);
    setModal("edit");
  }

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/super-admin/social-promote/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug.trim(),
        name: form.name.trim(),
        maxChars: parseInt(form.maxChars) || 0,
        hashtagStyle: form.hashtagStyle,
        promptAddendum: form.promptAddendum,
        isPremiumOnly: form.isPremiumOnly,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setPlatforms((prev) => [...prev, created]);
      setModal(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create platform.");
    }
    setSaving(false);
  }

  async function handleEdit() {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/super-admin/social-promote/platforms/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        maxChars: parseInt(form.maxChars) || 0,
        hashtagStyle: form.hashtagStyle,
        promptAddendum: form.promptAddendum,
        isPremiumOnly: form.isPremiumOnly,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlatforms((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      setModal(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not update platform.");
    }
    setSaving(false);
  }

  async function handleToggle(p: Platform) {
    setTogglingId(p.id);
    const res = await fetch(`/api/super-admin/social-promote/platforms/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlatforms((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    }
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/super-admin/social-promote/platforms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Could not delete platform.");
    }
    setDeletingId(null);
  }

  return (
    <>
      {modal === "add" && (
        <PlatformModal title="Add platform" form={form} setForm={setForm} onSave={handleAdd}
          onClose={() => setModal(null)} saving={saving} slugLocked={false} error={error} />
      )}
      {modal === "edit" && (
        <PlatformModal title="Edit platform" form={form} setForm={setForm} onSave={handleEdit}
          onClose={() => setModal(null)} saving={saving} slugLocked={true} error={error} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this platform?</h3>
            <p className="text-sm text-gray-500 mb-6">Authors will no longer be able to generate posts for it.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(confirmDelete)} disabled={!!deletingId}>
                <Trash2 className="h-4 w-4 mr-1.5" />{deletingId ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {platforms.length} platform{platforms.length === 1 ? "" : "s"} configured.
          </p>
          <Button onClick={openAdd} className="flex-shrink-0 ml-4">
            <Plus className="h-4 w-4 mr-2" />Add platform
          </Button>
        </div>

        {platforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <Share2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No platforms yet.</p>
            <button onClick={openAdd} className="mt-2 text-sm text-purple-600 hover:underline">
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {platforms.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${p.isActive ? "border-purple-200" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(p)}
                    disabled={togglingId === p.id}
                    title={p.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 mt-0.5 items-center rounded-full transition-colors disabled:opacity-40 ${
                      p.isActive ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-400">/{p.slug}</span>
                      {p.isPremiumOnly && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          Premium only
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        {p.maxChars.toLocaleString()} chars
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        # {p.hashtagStyle}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">Order: {p.sortOrder}</span>
                    </div>
                    {p.promptAddendum && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.promptAddendum}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
