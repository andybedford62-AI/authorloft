"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X, Mail } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";
import { Button } from "@/components/ui/button";

type SupportEmail = {
  id: string;
  label: string;
  email: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

type EditState = {
  label: string;
  email: string;
  description: string;
};

const emptyForm: EditState = { label: "", email: "", description: "" };

export function SupportEmailsPanel({ initialEmails }: { initialEmails: SupportEmail[] }) {
  const router = useRouter();
  const [emails, setEmails] = useState<SupportEmail[]>(initialEmails);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<EditState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!addForm.label.trim() || !addForm.email.trim()) return;
    setSaving(true);
    const res = await fetch("/api/super-admin/support-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: addForm.label.trim(),
        email: addForm.email.trim(),
        description: addForm.description.trim() || null,
        sortOrder: emails.length,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setEmails((prev) => [...prev, created]);
      setAddForm(emptyForm);
      setAdding(false);
      router.refresh();
    }
    setSaving(false);
  }

  function startEdit(e: SupportEmail) {
    setEditingId(e.id);
    setEditForm({ label: e.label, email: e.email, description: e.description ?? "" });
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.label.trim() || !editForm.email.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/super-admin/support-emails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: editForm.label.trim(),
        email: editForm.email.trim(),
        description: editForm.description.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEmails((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleToggle(e: SupportEmail) {
    setTogglingId(e.id);
    const res = await fetch(`/api/super-admin/support-emails/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !e.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEmails((prev) => prev.map((x) => (x.id === e.id ? updated : x)));
      router.refresh();
    }
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/super-admin/support-emails/${id}`, { method: "DELETE" });
    setEmails((prev) => prev.filter((e) => e.id !== id));
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
            <h3 className="font-semibold text-gray-900 mb-2">Delete this email address?</h3>
            <p className="text-sm text-gray-500 mb-6">
              It will no longer appear in contact form dropdowns.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete}>
                <Trash2 className="h-4 w-4 mr-1.5" />{deletingId === confirmDelete ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Manage the email addresses authors and visitors can route contact inquiries to.
            Active emails appear in contact form dropdowns.
          </p>
          {!adding && (
            <Button onClick={() => { setAdding(true); setAddForm(emptyForm); }} className="flex-shrink-0 ml-4">
              <Plus className="h-4 w-4 mr-2" />Add Email
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Email Address</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Description</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emails.map((e) => (
                <tr key={e.id} className="bg-white hover:bg-gray-50 transition-colors">
                  {editingId === e.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={editForm.label}
                          onChange={(ev) => setEditForm((f) => ({ ...f, label: ev.target.value }))}
                          placeholder="Label"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(ev) => setEditForm((f) => ({ ...f, email: ev.target.value }))}
                          placeholder="email@example.com"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <input
                          value={editForm.description}
                          onChange={(ev) => setEditForm((f) => ({ ...f, description: ev.target.value }))}
                          placeholder="Optional description"
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-3 text-center" />
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <IconButton
                            icon={<Check className="h-4 w-4" />}
                            title="Save"
                            variant="edit"
                            onClick={() => handleSaveEdit(e.id)}
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
                      <td className="px-4 py-3 font-medium text-gray-900">{e.label}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${e.email}`}
                          className="flex items-center gap-1.5 text-purple-600 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          {e.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {e.description || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(e)}
                          disabled={togglingId === e.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${
                            e.isActive ? "bg-purple-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              e.isActive ? "translate-x-4" : "translate-x-0.5"
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
                            onClick={() => startEdit(e)}
                          />
                          <IconButton
                            icon={<Trash2 className="h-4 w-4" />}
                            title="Delete"
                            variant="delete"
                            onClick={() => setConfirmDelete(e.id)}
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
                  <td className="px-4 py-3">
                    <input
                      autoFocus
                      value={addForm.label}
                      onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                      placeholder="e.g. Technical Support"
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="support@authorloft.com"
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <input
                      value={addForm.description}
                      onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Optional — shown to users in dropdown"
                      className={inputCls}
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
                        disabled={saving || !addForm.label.trim() || !addForm.email.trim()}
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

              {emails.length === 0 && !adding && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No email addresses yet.{" "}
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
