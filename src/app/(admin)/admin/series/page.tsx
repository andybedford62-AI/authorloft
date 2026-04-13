"use client";

import { useState, useEffect, useCallback } from "react";
import { Library, Plus, Pencil, Trash2, BookOpen, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Series = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { books: number };
};

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchSeries = useCallback(async () => {
    const res = await fetch("/api/admin/series-list");
    if (res.ok) setSeriesList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSaving(true);
    const res = await fetch("/api/admin/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, description: addDesc }),
    });
    if (res.ok) {
      setAddName(""); setAddDesc(""); setShowAdd(false);
      fetchSeries();
    } else {
      const d = await res.json().catch(() => ({}));
      setAddError(d.error || "Could not save series.");
    }
    setAddSaving(false);
  }

  function startEdit(s: Series) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditDesc(s.description ?? "");
    setEditError("");
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    setEditError("");
    setEditSaving(true);
    const res = await fetch(`/api/admin/series/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchSeries();
    } else {
      const d = await res.json().catch(() => ({}));
      setEditError(d.error || "Could not update series.");
    }
    setEditSaving(false);
  }

  async function handleDelete(id: string, name: string, bookCount: number) {
    const msg = bookCount > 0
      ? `Delete "${name}"? This will unlink ${bookCount} book${bookCount !== 1 ? "s" : ""} from this series (the books themselves won't be deleted).`
      : `Delete "${name}"? This cannot be undone.`;
    if (!confirm(msg)) return;

    const res = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    if (res.ok) fetchSeries();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Series</h1>
          <p className="text-sm text-gray-500 mt-1">
            Group your books into series to help readers follow along in order.
          </p>
        </div>
        <Button onClick={() => { setShowAdd(true); setAddError(""); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Series
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-blue-900">New Series</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Series Name *"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. The Deep Blue Files"
              required
            />
            <Input
              label="Description"
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              placeholder="Optional short description"
            />
          </div>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={addSaving}>
              {addSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Series"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Series list */}
      {seriesList.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Library className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No series yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Create a series to group related books together.</p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Series
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {seriesList.map((s) => (
            <div key={s.id} className="px-5 py-4">
              {editingId === s.id ? (
                /* Inline edit form */
                <form onSubmit={(e) => handleEdit(e, s.id)} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      label="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <Input
                      label="Description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={editSaving}>
                      {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Save</>}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 mr-1" />Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                /* Display row */
                <div className="flex items-center gap-4 group">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Library className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{s.slug}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <BookOpen className="h-3 w-3" />
                        {s._count.books} book{s._count.books !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name, s._count.books)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
