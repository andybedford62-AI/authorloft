"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, HelpCircle, X } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
};

type FaqCategory = { id: string; name: string; slug: string };

type FormState = {
  question: string;
  answer: string;
  category: string;
  sortOrder: string;
};

const emptyForm: FormState = { question: "", answer: "", category: "", sortOrder: "0" };

function FaqModal({
  title,
  form,
  setForm,
  onSave,
  onClose,
  saving,
  categories,
}: {
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  categories: FaqCategory[];
}) {
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Question <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="e.g. Is AuthorLoft free?"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Answer <span className="text-red-500">*</span></label>
            <RichTextEditor
              value={form.answer}
              onChange={(html) => setForm({ ...form, answer: html })}
              placeholder="Write the answer here…"
              minHeight="160px"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                <option value="">General</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Groups this FAQ on the public /faq page</p>
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.question.trim() || !form.answer.trim()}
            className="px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {saving ? "Saving…" : "Save FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FaqsPanel({ initialFaqs }: { initialFaqs: Faq[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/super-admin/categories?type=faq")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: FaqCategory[]) => setCategories(rows.filter(Boolean)))
      .catch(() => {});
  }, []);

  const catName = (slug: string | null) =>
    slug ? (categories.find((c) => c.slug === slug)?.name ?? slug) : null;

  function openAdd() {
    setForm({ ...emptyForm, sortOrder: faqs.length.toString() });
    setModal("add");
  }

  function openEdit(f: Faq) {
    setEditingId(f.id);
    setForm({ question: f.question, answer: f.answer, category: f.category ?? "", sortOrder: f.sortOrder.toString() });
    setModal("edit");
  }

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/super-admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:  form.question.trim(),
        answer:    form.answer.trim(),
        category:  form.category || null,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setFaqs((prev) => [...prev, created]);
      setModal(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleEdit() {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/super-admin/faqs/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:  form.question.trim(),
        answer:    form.answer.trim(),
        category:  form.category || null,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFaqs((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
      setModal(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleToggle(faq: Faq) {
    setTogglingId(faq.id);
    const res = await fetch(`/api/super-admin/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    }
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/super-admin/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
    router.refresh();
  }

  return (
    <>
      {modal === "add" && (
        <FaqModal title="Add FAQ" form={form} setForm={setForm} onSave={handleAdd} onClose={() => setModal(null)} saving={saving} categories={categories} />
      )}
      {modal === "edit" && (
        <FaqModal title="Edit FAQ" form={form} setForm={setForm} onSave={handleEdit} onClose={() => setModal(null)} saving={saving} categories={categories} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this FAQ?</h3>
            <p className="text-sm text-gray-500 mb-6">It will be removed from the homepage.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!deletingId}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {deletingId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Active FAQs appear in the FAQ accordion on the homepage and in search engine structured data.
          </p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-4"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No FAQs yet.</p>
            <button onClick={openAdd} className="mt-2 text-sm text-purple-600 hover:underline">
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${faq.isActive ? "border-purple-200" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(faq)}
                    disabled={togglingId === faq.id}
                    title={faq.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 mt-0.5 items-center rounded-full transition-colors disabled:opacity-40 ${
                      faq.isActive ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${faq.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{faq.question}</span>
                      {catName(faq.category) && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                          {catName(faq.category)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">Order: {faq.sortOrder}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{faq.answer.replace(/<[^>]+>/g, " ").trim()}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(faq)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(faq.id)}
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
