"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus, Pencil, Trash2, Tag, FolderOpen, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/admin/icon-button";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  _count: { courses: number };
  children: Category[];
};

// ── Inline-edit row ──────────────────────────────────────────────────────────

function CategoryRow({
  category,
  depth,
  onRefresh,
  onAddChild,
}: {
  category: Category;
  depth: number;
  onRefresh: () => void;
  onAddChild: (parentId: string, parentName: string) => void;
}) {
  const [expanded, setExpanded]   = useState(true);
  const [editing, setEditing]     = useState(false);
  const [editName, setEditName]   = useState(category.name);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");

  const hasChildren = category.children && category.children.length > 0;

  async function handleSave() {
    if (!editName.trim() || editName.trim() === category.name) { setEditing(false); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/course-categories/${category.id}`, {
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
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/course-categories/${category.id}`, { method: "DELETE" });
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
          <span className="text-sm text-gray-900 flex-1">{category.name}</span>
        )}

        <span className="text-xs text-gray-400 hidden sm:block w-40 truncate">{category.slug}</span>
        {category._count.courses > 0 && (
          <span className="text-xs text-gray-400 hidden sm:block">{category._count.courses} course{category._count.courses !== 1 ? "s" : ""}</span>
        )}

        {/* Action buttons */}
        {editing ? (
          <div className="flex items-center gap-1 ml-2">
            <IconButton icon={<Check className="h-4 w-4" />} title="Save" variant="ghost" onClick={handleSave} loading={saving} />
            <IconButton icon={<X className="h-4 w-4" />} title="Cancel" variant="ghost" onClick={() => { setEditing(false); setEditName(category.name); setError(""); }} />
          </div>
        ) : (
          <div className="flex items-center gap-1 ml-2">
            <IconButton icon={<Pencil className="h-4 w-4" />} title="Edit" variant="edit" onClick={() => { setEditing(true); setEditName(category.name); }} />
            <IconButton icon={<Plus className="h-4 w-4" />} title="Add sub-category" variant="add" onClick={() => onAddChild(category.id, category.name)} />
            <IconButton icon={<Trash2 className="h-4 w-4" />} title="Delete" variant="delete" onClick={handleDelete} loading={deleting} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 px-4 pb-1" style={{ paddingLeft: `${16 + depth * 24 + 24}px` }}>{error}</p>
      )}

      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryRow key={child.id} category={child} depth={depth + 1} onRefresh={onRefresh} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add form ─────────────────────────────────────────────────────────────────

function AddCategoryForm({
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
    const res = await fetch("/api/admin/course-categories", {
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
        {parentId ? `New sub-category under "${parentName}"` : "New Top-Level Category"}
      </h2>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Category Name"
            placeholder={parentId ? "e.g. Watercolor Techniques" : "e.g. Arts & Crafts"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" size="sm" disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Category"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

// Course Categories are ONE shared, platform-wide list every author's course
// picker reads from (curated centrally, not per-author) — see
// docs/CHANGELOG.md Aug 17 2026. Management therefore stays Super Admin-only.
export default function CourseCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addParentName, setAddParentName] = useState<string | null>(null);
  const [showTopAdd, setShowTopAdd]   = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!(session?.user as any)?.isSuperAdmin) router.replace("/admin/dashboard");
  }, [session, status, router]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/course-categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

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
    loadCategories();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide course taxonomy, separate from book genres. Authors select from these when cataloguing courses.
          </p>
        </div>
        <Button onClick={() => { setShowTopAdd(true); setAddParentId(null); setAddParentName(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Top-level add form */}
      {showTopAdd && (
        <AddCategoryForm
          parentId={null}
          parentName={null}
          onSave={handleSaved}
          onCancel={() => setShowTopAdd(false)}
        />
      )}

      {/* Sub-category add form */}
      {addParentId && (
        <AddCategoryForm
          parentId={addParentId}
          parentName={addParentName}
          onSave={handleSaved}
          onCancel={() => { setAddParentId(null); setAddParentName(null); }}
        />
      )}

      {/* Category tree */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide font-medium">
            <span>Category</span>
            <div className="flex gap-8 pr-1">
              <span className="hidden sm:block">Slug</span>
              <span className="hidden sm:block">Courses</span>
            </div>
          </div>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading categories…
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No categories yet. Click <strong>Add Category</strong> to create the first one.
            </div>
          ) : (
            categories.map((category) => (
              <CategoryRow key={category.id} category={category} depth={0} onRefresh={loadCategories} onAddChild={handleAddChild} />
            ))
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Click the <strong>pencil</strong> to rename inline, <strong>+</strong> to add a sub-category, or <strong>trash</strong> to delete. Categories with courses or sub-categories cannot be deleted until cleared.
        </p>
      </div>
    </div>
  );
}
