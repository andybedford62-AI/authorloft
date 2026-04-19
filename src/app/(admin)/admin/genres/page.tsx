"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus, Pencil, Trash2, Tag, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLACEHOLDER_GENRES } from "@/lib/placeholder-data";

// Recursive genre tree node
function GenreNode({
  genre,
  depth = 0,
}: {
  genre: (typeof PLACEHOLDER_GENRES)[0] & { children?: any[] };
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = genre.children && genre.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-4 hover:bg-gray-50 rounded-lg group transition-colors"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 cursor-pointer">
            <ChevronRight
              className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <Tag className="h-4 w-4 text-gray-300 flex-shrink-0" />
        )}

        {hasChildren ? (
          <FolderOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
        ) : null}

        <span className="text-sm text-gray-900 flex-1">{genre.name}</span>
        <span className="text-xs text-gray-400 hidden sm:block">{genre.slug}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors cursor-pointer" title="Add sub-genre">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {genre.children!.map((child) => (
            <GenreNode key={child.id} genre={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GenresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!(session?.user as any)?.isSuperAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !(session?.user as any)?.isSuperAdmin) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Genres & Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your books with an unlimited hierarchy of genres and categories.
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Genre
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-blue-900">New Top-Level Genre</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Genre Name" placeholder="e.g. Children's Books" />
            <Input label="Parent Genre" placeholder="None (top-level)" hint="Leave blank for a top-level genre" />
          </div>
          <div className="flex gap-2">
            <Button size="sm">Save Genre</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Genre Tree */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide font-medium">
            <span>Genre / Category</span>
            <span>Slug</span>
          </div>
        </div>
        <div className="p-2">
          {PLACEHOLDER_GENRES.map((genre) => (
            <GenreNode key={genre.id} genre={genre as any} />
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Unlimited nesting:</strong> You can create genres within genres to any depth
          (e.g. Fiction → Thriller → Underwater Thriller). Use the{" "}
          <strong>+</strong> button on any genre to add a child category.
        </p>
      </div>
    </div>
  );
}
