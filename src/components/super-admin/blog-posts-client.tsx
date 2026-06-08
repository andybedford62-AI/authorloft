"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

type Post = {
  id:              string;
  title:           string;
  slug:            string;
  category:        string;
  isNews:          boolean;
  isPublished:     boolean;
  publishedAt:     string | null;
  displayOrder:    number;
  readTimeMinutes: number;
  createdAt:       string;
};

function SortableRow({ post, onDelete, dragEnabled }: { post: Post; onDelete: (id: string) => void; dragEnabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
    background: isDragging ? "#f9fafb" : undefined,
  };

  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-3 w-8">
        {dragEnabled ? (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none p-0.5"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="block w-4" />
        )}
      </td>
      <td className="py-3 px-3 max-w-xs">
        <span className="block text-sm font-medium text-gray-900 truncate">{post.title}</span>
        <span className="text-xs text-gray-400 font-mono">/{post.isNews ? "news" : "blog"}/{post.slug}</span>
      </td>
      <td className="py-3 px-3">
        {post.isNews ? (
          <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">News</span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">Blog</span>
        )}
      </td>
      <td className="py-3 px-3 text-sm text-gray-500">{post.category || "—"}</td>
      <td className="py-3 px-3">
        {post.isPublished ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" /> Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <EyeOff className="h-3 w-3" /> Draft
          </span>
        )}
      </td>
      <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">{dateLabel}</td>
      <td className="py-3 px-3 text-sm text-gray-400 text-center">{post.readTimeMinutes} min</td>
      <td className="py-3 px-3">
        <div className="flex items-center justify-end gap-1">
          {post.isPublished && (
            <a
              href={`/${post.isNews ? "news" : "blog"}/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="View live"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Link
            href={`/super-admin/blog/${post.id}/edit`}
            className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

type TypeFilter = "all" | "blog" | "news";

export function BlogPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts,  setPosts]  = useState(initialPosts);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [filter, setFilter] = useState<TypeFilter>("all");
  const router = useRouter();

  const visiblePosts =
    filter === "all" ? posts : posts.filter((p) => (filter === "news" ? p.isNews : !p.isNews));
  const dragEnabled = filter === "all";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex  = posts.findIndex((p) => p.id === active.id);
    const newIndex  = posts.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(posts, oldIndex, newIndex);

    setPosts(reordered);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/super-admin/blog/posts/reorder", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderedIds: reordered.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError("Failed to save new order. Reverting.");
      setPosts(initialPosts);
    } finally {
      setSaving(false);
    }
  }, [posts, initialPosts]);

  const handleDelete = useCallback(async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!confirm(`Delete "${post?.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/super-admin/blog/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  }, [posts, router]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500 text-sm mb-3">No blog posts yet.</p>
        <Link href="/super-admin/blog/new" className="text-sm font-medium text-purple-600 hover:text-purple-800">
          Create your first post →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Type filter */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {([
          ["all",  `All (${posts.length})`],
          ["blog", `Blog (${posts.filter((p) => !p.isNews).length})`],
          ["news", `News (${posts.filter((p) => p.isNews).length})`],
        ] as [TypeFilter, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between h-5">
        {saving && <p className="text-xs text-gray-400">Saving order…</p>}
        {error  && <p className="text-xs text-red-500">{error}</p>}
        {!saving && !error && <span />}
        <p className="text-xs text-gray-400">
          {visiblePosts.filter((p) => p.isPublished).length} published · {visiblePosts.filter((p) => !p.isPublished).length} drafts
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-2.5 px-3 w-8" />
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="py-2.5 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Read Time</th>
              <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visiblePosts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {visiblePosts.map((post) => (
                  <SortableRow key={post.id} post={post} onDelete={handleDelete} dragEnabled={dragEnabled} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <p className="text-xs text-gray-400 px-1">
        {dragEnabled
          ? "Drag rows to change CMS display order. Public pages always show most recently published first."
          : "Switch to “All” to drag-reorder. Public pages always show most recently published first."}
      </p>
    </div>
  );
}
