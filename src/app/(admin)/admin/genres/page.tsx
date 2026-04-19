"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus, Pencil, Trash2, Tag, FolderOpen, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/admin/icon-button";

type Genre = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  _count: { books: number };
  children: Genre[];
};

// ── Inline-edit row ──────────────────────────────────────────────────────────

function GenreRow({
  genre,
  depth,
  onRefresh,
  onAddChild,
}: {
  genre: Genre;
  depth: number;
  onRefresh: () => void;
  onAddChild: (parentId: string, parentName: string) => void;
}) {
  const [expanded, setExpanded]   = useState(true);
  const [editing, setEditing]     = useState(false);
  const [editName, setEditName]   = useState(genre.name);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");

  const hasChildren = genre.children && genre.children.length > 0;

  async function handleSave() {
    if (!editName.trim() || editName.trim() === genre.name) { setEditing(false); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/genres/${genre.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Save failed"); return; }
    setEditing(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${genre.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/genres/${genre.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);
    if (!res.ok) { setError(data.error || "Delete failed"); return; }
    onRefresh();
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 hover:bg-gray-50 rounded-lg group transition-colors pr-3"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 cursor-pointer">
            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <Tag className="h-4 w-4 text-gray-300 flex-shrink-0" />
        )}
        {hasChildren && <FolderOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />}

        {/* Name / edit field */}
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
            className="flex-1 text-sm border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <span className="text-sm text-gray-900 flex-1">{genre.name}</span>
        )}

        <span className="text-xs text-gray-400 hidden sm:block w-40 truncate">{genre.slug}</span>
        {genre._count.books > 0 && (
          <span className="text-xs text-gray-400 hidden sm:block">{genre._count.books} book{genre._count.books !== 1 ? "s" : ""}</span>
        )}

        {/* Action buttons */}
        {editing ? (
          <div className="flex items-center gap-1 ml-2">
            <IconButton icon={<Check className="h-4 w-4" />} title="Save" variant="success" onClick={handleSave} loading={saving} />
            <IconButton icon={<X className="h-4 w-4" />} title="Cancel" variant="ghost" onClick={() => { setEditing(false); setEditName(genre.name); setError(""); }} />
          </div>
        ) : (
          <div className="flex items-center gap-1 ml-2">
            <IconButton icon={<Pencil className="h-4 w-4" />} title="Rename" variant="primary" onClick={() => { setEditing(true); setEditName(genre.name); }} />
            <IconButton icon={<Plus className="h-4 w-4" />} title="Add sub-genre" variant="success" onClick={() => onAddChild(genre.id, genre.name)} />
            <IconButton icon={<Trash2 className="h-4 w-4" />} title="Delete" variant="danger" onClick={handleDelete} loading={deleting} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 px-4 pb-1" style={{ paddingLeft: `${16 + depth * 24 + 24}px` }}>{error}</p>
      )}

      {hasChildren && expanded && (
        <div>
          {genre.children.map((child) => (
            <GenreRow key={child.id} genre={child} depth={depth + 1} onRefresh={onRefresh} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add form ─────────────────────────────────────────────────────────────────

function AddGenreForm({
  parentId,
  parentName,
  onSave,
  onCancel,
}: {
  parentId: string | null;
  parentName: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parentId }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Save failed"); return; }
    setName("");
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-blue-900">
        {parentId ? `New sub-genre under "${parentName}"` : "New Top-Level Genre"}
      </h2>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Genre Name"
            placeholder={parentId ? "e.g. Cozy Mystery" : "e.g. Children's Books"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" size="sm" disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Genre"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GenresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [genres, setGenres]           = useState<Genre[]>([]);
  const [loading, setLoading]         = useState(true);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addParentName, setAddParentName] = useState<string | null>(null);
  const [showTopAdd, setShowTopAdd]   = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!(session?.user as any)?.isSuperAdmin) router.replace("/admin/dashboard");
  }, [session, status, router]);

  const loadGenres = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/genres");
    const data = await res.json();
    setGenres(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGenres(); }, [loadGenres]);

  if (status === "loading" || !(session?.user as any)?.isSuperAdmin) return null;

  function handleAddChild(parentId: string, parentName: string) {
    setShowTopAdd(false);
    setAddParentId(parentId);
    setAddParentName(parentName);
  }

  function handleSaved() {
    setShowTopAdd(false);
    setAddParentId(null);
    setAddParentName(null);
    loadGenres();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Genres &amp; Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide genre taxonomy. Authors select from these when cataloguing books.
          </p>
        </div>
        <Button onClick={() => { setShowTopAdd(true); setAddParentId(null); setAddParentName(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Genre
        </Button>
      </div>

      {/* Top-level add form */}
      {showTopAdd && (
        <AddGenreForm
          parentId={null}
          parentName={null}
          onSave={handleSaved}
          onCancel={() => setShowTopAdd(false)}
        />
      )}

      {/* Sub-genre add form */}
      {addParentId && (
        <AddGenreForm
          parentId={addParentId}
          parentName={addParentName}
          onSave={handleSaved}
          onCancel={() => { setAddParentId(null); setAddParentName(null); }}
        />
      )}

      {/* Genre tree */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide font-medium">
            <span>Genre / Category</span>
            <div className="flex gap-8 pr-1">
              <span className="hidden sm:block">Slug</span>
              <span className="hidden sm:block">Books</span>
            </div>
          </div>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading genres…
            </div>
          ) : genres.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No genres yet. Click <strong>Add Genre</strong> to create the first one.
            </div>
          ) : (
            genres.map((genre) => (
              <GenreRow key={genre.id} genre={genre} depth={0} onRefresh={loadGenres} onAddChild={handleAddChild} />
            ))
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Click the <strong>pencil</strong> to rename inline, <strong>+</strong> to add a sub-genre, or <strong>trash</strong> to delete. Genres with books or sub-genres cannot be deleted until cleared.
        </p>
      </div>
    </div>
  );
}
