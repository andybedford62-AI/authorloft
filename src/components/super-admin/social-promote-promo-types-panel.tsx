"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, Plus, Layers, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PromoType = {
  id: string;
  slug: string;
  name: string;
  description: string;
  promptTemplate: string;
  applicableContexts: string[];
  applicablePlatforms: string[];
  isActive: boolean;
  sortOrder: number;
};

type PlatformOption = { slug: string; name: string };

type FormState = {
  slug: string;
  name: string;
  description: string;
  promptTemplate: string;
  applicableContexts: string[];
  applicablePlatforms: string[];
  sortOrder: string;
};

const ALL_CONTEXTS = [
  { value: "book",  label: "Book" },
  { value: "news",  label: "News post" },
  { value: "topic", label: "Free-text topic" },
];

const emptyForm: FormState = {
  slug: "", name: "", description: "", promptTemplate: "",
  applicableContexts: [], applicablePlatforms: [], sortOrder: "0",
};

function PromoTypeModal({
  title, form, setForm, onSave, onClose, saving, slugLocked, platforms, error,
}: {
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  slugLocked: boolean;
  platforms: PlatformOption[];
  error: string | null;
}) {
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  function toggleArr(key: "applicableContexts" | "applicablePlatforms", value: string) {
    const arr = form[key];
    setForm({ ...form, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] flex flex-col">
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
                placeholder="e.g. New Release Announcement"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Slug <span className="text-red-500">*</span></label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. new-release"
                disabled={slugLocked}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">{slugLocked ? "Slug cannot be changed after creation." : "Lowercase, hyphens only."}</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short helper text shown to authors in the picker"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Prompt template <span className="text-red-500">*</span></label>
            <textarea
              value={form.promptTemplate}
              onChange={(e) => setForm({ ...form, promptTemplate: e.target.value })}
              placeholder='e.g. Write a social post announcing the new release of "{{book.title}}" by {{author.displayName}}…'
              rows={5}
              className={inputCls + " font-mono"}
            />
            <p className="text-xs text-gray-400 mt-1">
              Available tokens: <code className="bg-gray-100 px-1 rounded">{"{{book.title}}"}</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{author.displayName}}"}</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{voice}}"}</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">{"{{topic}}"}</code>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Applicable contexts</label>
              <div className="space-y-2 p-3 border border-gray-200 rounded-lg">
                {ALL_CONTEXTS.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.applicableContexts.includes(c.value)}
                      onChange={() => toggleArr("applicableContexts", c.value)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Empty = applies to all contexts.</p>
            </div>

            <div>
              <label className={labelCls}>Applicable platforms</label>
              <div className="space-y-2 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {platforms.length === 0 ? (
                  <p className="text-xs text-gray-400">No platforms configured.</p>
                ) : (
                  platforms.map((p) => (
                    <label key={p.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.applicablePlatforms.includes(p.slug)}
                        onChange={() => toggleArr("applicablePlatforms", p.slug)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      {p.name}
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Empty = applies to all platforms.</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className={inputCls + " max-w-[120px]"}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.name.trim() || !form.slug.trim() || !form.promptTemplate.trim()}
          >
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SocialPromotePromoTypesPanel({
  initialPromoTypes, platforms,
}: {
  initialPromoTypes: PromoType[];
  platforms: PlatformOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [promoTypes, setPromoTypes] = useState<PromoType[]>(initialPromoTypes);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const platformNameBySlug = (slug: string) => platforms.find((p) => p.slug === slug)?.name ?? slug;

  // Deep-link: ?edit=<slug> auto-opens the edit modal for that promo type (used by the Prompts page jump)
  useEffect(() => {
    const editSlug = searchParams.get("edit");
    if (!editSlug || modal) return;
    const target = promoTypes.find((t) => t.slug === editSlug);
    if (target) openEdit(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function openAdd() {
    setForm({ ...emptyForm, sortOrder: promoTypes.length.toString() });
    setError(null);
    setModal("add");
  }

  function openEdit(t: PromoType) {
    setEditingId(t.id);
    setForm({
      slug: t.slug,
      name: t.name,
      description: t.description,
      promptTemplate: t.promptTemplate,
      applicableContexts: t.applicableContexts,
      applicablePlatforms: t.applicablePlatforms,
      sortOrder: t.sortOrder.toString(),
    });
    setError(null);
    setModal("edit");
  }

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/super-admin/social-promote/promo-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description,
        promptTemplate: form.promptTemplate,
        applicableContexts: form.applicableContexts,
        applicablePlatforms: form.applicablePlatforms,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setPromoTypes((prev) => [...prev, created]);
      setModal(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create promo type.");
    }
    setSaving(false);
  }

  async function handleEdit() {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/super-admin/social-promote/promo-types/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description,
        promptTemplate: form.promptTemplate,
        applicableContexts: form.applicableContexts,
        applicablePlatforms: form.applicablePlatforms,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPromoTypes((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setModal(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not update promo type.");
    }
    setSaving(false);
  }

  async function handleToggle(t: PromoType) {
    setTogglingId(t.id);
    const res = await fetch(`/api/super-admin/social-promote/promo-types/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPromoTypes((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    }
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/super-admin/social-promote/promo-types/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPromoTypes((prev) => prev.filter((t) => t.id !== id));
      setConfirmDelete(null);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Could not delete promo type.");
    }
    setDeletingId(null);
  }

  return (
    <>
      {modal === "add" && (
        <PromoTypeModal title="Add promo type" form={form} setForm={setForm} onSave={handleAdd}
          onClose={() => setModal(null)} saving={saving} slugLocked={false} platforms={platforms} error={error} />
      )}
      {modal === "edit" && (
        <PromoTypeModal title="Edit promo type" form={form} setForm={setForm} onSave={handleEdit}
          onClose={() => setModal(null)} saving={saving} slugLocked={true} platforms={platforms} error={error} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this promo type?</h3>
            <p className="text-sm text-gray-500 mb-6">Authors will no longer see it in the promo picker.</p>
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
            {promoTypes.length} promo type{promoTypes.length === 1 ? "" : "s"} configured.
          </p>
          <Button onClick={openAdd} className="flex-shrink-0 ml-4">
            <Plus className="h-4 w-4 mr-2" />Add promo type
          </Button>
        </div>

        {promoTypes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <Layers className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No promo types yet.</p>
            <button onClick={openAdd} className="mt-2 text-sm text-purple-600 hover:underline">
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {promoTypes.map((t) => (
              <div
                key={t.id}
                id={`promo-${t.slug}`}
                className={`bg-white rounded-xl border p-4 transition-colors scroll-mt-24 target:ring-2 target:ring-purple-400 ${t.isActive ? "border-purple-200" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(t)}
                    disabled={togglingId === t.id}
                    title={t.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 mt-0.5 items-center rounded-full transition-colors disabled:opacity-40 ${
                      t.isActive ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${t.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                      <span className="text-xs text-gray-400">/{t.slug}</span>
                      {t.applicableContexts.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {t.applicableContexts.join(", ")}
                        </span>
                      )}
                      {t.applicablePlatforms.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          {t.applicablePlatforms.map(platformNameBySlug).join(", ")}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">Order: {t.sortOrder}</span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1 leading-relaxed">{t.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 font-mono leading-relaxed">{t.promptTemplate}</p>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
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
