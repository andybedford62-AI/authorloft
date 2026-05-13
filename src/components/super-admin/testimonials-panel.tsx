"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X, Star } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";

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

type EditState = {
  authorName: string;
  authorRole: string;
  quote: string;
  rating: string;
  image: string;
  displayOrder: string;
};

const emptyForm: EditState = { authorName: "", authorRole: "", quote: "", rating: "", image: "", displayOrder: "0" };

export function TestimonialsPanel({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<EditState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!addForm.authorName.trim() || !addForm.quote.trim()) return;
    setSaving(true);
    const res = await fetch("/api/super-admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: addForm.authorName.trim(),
        authorRole: addForm.authorRole.trim() || null,
        quote: addForm.quote.trim(),
        rating: addForm.rating ? parseInt(addForm.rating) : null,
        image: addForm.image.trim() || null,
        displayOrder: testimonials.length,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setTestimonials((prev) => [...prev, created]);
      setAddForm(emptyForm);
      setAdding(false);
      router.refresh();
    }
    setSaving(false);
  }

  function startEdit(t: Testimonial) {
    setEditingId(t.id);
    setEditForm({
      authorName: t.authorName,
      authorRole: t.authorRole ?? "",
      quote: t.quote,
      rating: t.rating?.toString() ?? "",
      image: t.image ?? "",
      displayOrder: t.displayOrder.toString(),
    });
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.authorName.trim() || !editForm.quote.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/super-admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: editForm.authorName.trim(),
        authorRole: editForm.authorRole.trim() || null,
        quote: editForm.quote.trim(),
        rating: editForm.rating ? parseInt(editForm.rating) : null,
        image: editForm.image.trim() || null,
        displayOrder: parseInt(editForm.displayOrder) || 0,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
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
      router.refresh();
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

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this testimonial?</h3>
            <p className="text-sm text-gray-500 mb-6">
              It will be removed from the marketing page.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {deletingId === confirmDelete ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Add testimonials to showcase on the marketing page. Active testimonials will display.
            Use displayOrder to control which ones appear first.
          </p>
          {!adding && (
            <button
              onClick={() => { setAdding(true); setAddForm(emptyForm); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-4"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Quote</th>
                <th className="px-4 py-3 font-medium text-center hidden sm:table-cell">Rating</th>
                <th className="px-4 py-3 font-medium text-center hidden md:table-cell">Order</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {testimonials.map((t) => (
                <tr key={t.id} className="bg-white hover:bg-gray-50 transition-colors">
                  {editingId === t.id ? (
                    <>
                      <td className="px-4 py-3 space-y-2">
                        <input
                          value={editForm.authorName}
                          onChange={(ev) => setEditForm((f) => ({ ...f, authorName: ev.target.value }))}
                          placeholder="Author name"
                          className={inputCls}
                        />
                        <input
                          value={editForm.authorRole}
                          onChange={(ev) => setEditForm((f) => ({ ...f, authorRole: ev.target.value }))}
                          placeholder="Role (optional)"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <textarea
                          value={editForm.quote}
                          onChange={(ev) => setEditForm((f) => ({ ...f, quote: ev.target.value }))}
                          placeholder="Testimonial quote"
                          rows={2}
                          className={`${inputCls} resize-none`}
                        />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editForm.rating}
                          onChange={(ev) => setEditForm((f) => ({ ...f, rating: ev.target.value }))}
                          placeholder="1-5"
                          className={`${inputCls} text-center`}
                        />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <input
                          type="number"
                          value={editForm.displayOrder}
                          onChange={(ev) => setEditForm((f) => ({ ...f, displayOrder: ev.target.value }))}
                          className={`${inputCls} text-center`}
                        />
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <IconButton
                            icon={<Check className="h-4 w-4" />}
                            title="Save"
                            variant="edit"
                            onClick={() => handleSaveEdit(t.id)}
                            disabled={saving}
                          />
                          <IconButton
                            icon={<X className="h-4 w-4" />}
                            title="Cancel"
                            variant="delete"
                            onClick={() => setEditingId(null)}
                          />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{t.authorName}</div>
                          {t.authorRole && <div className="text-xs text-gray-500">{t.authorRole}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell line-clamp-2">
                        "{t.quote.substring(0, 100)}{t.quote.length > 100 ? "…" : ""}"
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {t.rating ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{t.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-sm font-medium text-gray-600">{t.displayOrder}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(t)}
                          disabled={togglingId === t.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${
                            t.isActive ? "bg-purple-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              t.isActive ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <IconButton
                            icon={<Pencil className="h-4 w-4" />}
                            title="Edit"
                            variant="edit"
                            onClick={() => startEdit(t)}
                          />
                          <IconButton
                            icon={<Trash2 className="h-4 w-4" />}
                            title="Delete"
                            variant="delete"
                            onClick={() => setConfirmDelete(t.id)}
                          />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* Add row */}
              {adding && (
                <tr className="bg-purple-50">
                  <td className="px-4 py-3 space-y-2">
                    <input
                      autoFocus
                      value={addForm.authorName}
                      onChange={(e) => setAddForm((f) => ({ ...f, authorName: e.target.value }))}
                      placeholder="Author name"
                      className={inputCls}
                    />
                    <input
                      value={addForm.authorRole}
                      onChange={(e) => setAddForm((f) => ({ ...f, authorRole: e.target.value }))}
                      placeholder="Role (optional)"
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <textarea
                      value={addForm.quote}
                      onChange={(e) => setAddForm((f) => ({ ...f, quote: e.target.value }))}
                      placeholder="Testimonial quote"
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={addForm.rating}
                      onChange={(e) => setAddForm((f) => ({ ...f, rating: e.target.value }))}
                      placeholder="1-5"
                      className={`${inputCls} text-center`}
                    />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <input
                      type="number"
                      value={addForm.displayOrder}
                      onChange={(e) => setAddForm((f) => ({ ...f, displayOrder: e.target.value }))}
                      placeholder="0"
                      className={`${inputCls} text-center`}
                    />
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <IconButton
                        icon={<Check className="h-4 w-4" />}
                        title="Save"
                        variant="edit"
                        onClick={handleAdd}
                        disabled={saving || !addForm.authorName.trim() || !addForm.quote.trim()}
                      />
                      <IconButton
                        icon={<X className="h-4 w-4" />}
                        title="Cancel"
                        variant="delete"
                        onClick={() => setAdding(false)}
                      />
                    </div>
                  </td>
                </tr>
              )}

              {testimonials.length === 0 && !adding && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No testimonials yet.{" "}
                    <button
                      onClick={() => setAdding(true)}
                      className="text-purple-600 hover:underline"
                    >
                      Add your first one →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
