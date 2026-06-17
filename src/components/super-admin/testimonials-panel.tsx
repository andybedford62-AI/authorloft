"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Star, X, Check, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
  image: string | null;
  isActive: boolean;
  displayOrder: number;
};

type FormState = {
  authorName: string;
  authorRole: string;
  quote: string;
  rating: number | null;
  displayOrder: string;
};

const emptyForm: FormState = { authorName: "", authorRole: "", quote: "", rating: null, displayOrder: "0" };

function StarPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= (hovered ?? value ?? 0)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-gray-400 hover:text-gray-600"
        >
          clear
        </button>
      )}
    </div>
  );
}

function TestimonialModal({
  title,
  form,
  setForm,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Author Name <span className="text-red-500">*</span></label>
              <input
                autoFocus
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="e.g. Jane Smith"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Role / Title <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                placeholder="e.g. Romance Author"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Quote <span className="text-red-500">*</span></label>
            <RichTextEditor
              value={form.quote}
              onChange={(val) => setForm({ ...form, quote: val })}
              placeholder="Write the testimonial quote here… (supports bold, italic, links)"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Star Rating <span className="text-gray-400 font-normal">(optional)</span></label>
              <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
            <div>
              <label className={labelCls}>Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.authorName.trim() || !form.quote.trim()}
          >
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save Testimonial</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsPanel({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openAdd() {
    setForm({ ...emptyForm, displayOrder: testimonials.length.toString() });
    setModal("add");
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setForm({
      authorName: t.authorName,
      authorRole: t.authorRole ?? "",
      quote: t.quote,
      rating: t.rating,
      displayOrder: t.displayOrder.toString(),
    });
    setModal("edit");
  }

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/super-admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: form.authorName.trim(),
        authorRole: form.authorRole.trim() || null,
        quote: form.quote.trim(),
        rating: form.rating,
        displayOrder: parseInt(form.displayOrder) || 0,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setTestimonials((prev) => [...prev, created]);
      setModal(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleEdit() {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/super-admin/testimonials/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: form.authorName.trim(),
        authorRole: form.authorRole.trim() || null,
        quote: form.quote.trim(),
        rating: form.rating,
        displayOrder: parseInt(form.displayOrder) || 0,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTestimonials((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setModal(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleToggle(t: Testimonial) {
    setTogglingId(t.id);
    const res = await fetch(`/api/super-admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    }
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/super-admin/testimonials/${id}`, { method: "DELETE" });
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
    router.refresh();
  }

  return (
    <>
      {/* Add / Edit modal */}
      {modal === "add" && (
        <TestimonialModal
          title="Add Testimonial"
          form={form}
          setForm={setForm}
          onSave={handleAdd}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === "edit" && (
        <TestimonialModal
          title="Edit Testimonial"
          form={form}
          setForm={setForm}
          onSave={handleEdit}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this testimonial?</h3>
            <p className="text-sm text-gray-500 mb-6">It will be removed from the marketing page.</p>
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
            Active testimonials (up to 3) appear on the marketing page in displayOrder order.
          </p>
          <Button onClick={openAdd} className="flex-shrink-0 ml-4">
            <Plus className="h-4 w-4 mr-2" />Add Testimonial
          </Button>
        </div>

        {/* Cards */}
        {testimonials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <Star className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No testimonials yet.</p>
            <button onClick={openAdd} className="mt-2 text-sm text-purple-600 hover:underline">
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  t.isActive ? "border-purple-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggle(t)}
                    disabled={togglingId === t.id}
                    title={t.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 mt-0.5 items-center rounded-full transition-colors disabled:opacity-40 ${
                      t.isActive ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        t.isActive ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{t.authorName}</span>
                      {t.authorRole && (
                        <span className="text-xs text-gray-500">— {t.authorRole}</span>
                      )}
                      {t.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">Order: {t.displayOrder}</span>
                    </div>
                    <p
                      className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: `"${t.quote}"`,
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
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
