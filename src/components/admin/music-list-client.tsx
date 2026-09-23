"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { GripVertical, ListMusic, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeaturedStarButton } from "@/components/admin/featured-star-button";

type MusicListRow = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  listInBookstore: boolean;
  trackCount: number;
};

export function MusicListClient({ initialLists }: { initialLists: MusicListRow[] }) {
  const [lists, setLists] = useState<MusicListRow[]>(initialLists);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveOk, setSaveOk] = useState(true);
  const dragId = useRef<string | null>(null);

  function handleDragStart(id: string) {
    dragId.current = id;
  }

  function handleDragEnter(id: string) {
    if (dragId.current === id) return;
    setLists((prev) => {
      const list = [...prev];
      const from = list.findIndex((l) => l.id === dragId.current);
      const to = list.findIndex((l) => l.id === id);
      if (from === -1 || to === -1) return prev;
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return list;
    });
  }

  function handleDragEnd() {
    dragId.current = null;
    saveOrder();
  }

  async function saveOrder() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/music/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: lists.map((l) => l.id) }),
      });
      setSaveOk(res.ok);
      setSaveMsg(res.ok ? "Order saved" : "Could not save order. Please try again.");
    } catch {
      setSaveOk(false);
      setSaveMsg("Network error — order not saved. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  }

  return (
    <div className="space-y-3">
      {lists.length > 1 && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-400">
          <span>
            Drag <GripVertical className="inline h-3 w-3" /> to reorder — this sets the
            order on your public Music page (top to bottom, left to right)
          </span>
          {saving && <span className="text-blue-500 animate-pulse">Saving…</span>}
          {saveMsg && !saving && (
            <span className={saveOk ? "text-green-600" : "text-red-600"}>{saveMsg}</span>
          )}
        </div>
      )}

      {lists.map((list) => (
        <div
          key={list.id}
          draggable
          onDragStart={() => handleDragStart(list.id)}
          onDragEnter={() => handleDragEnter(list.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group ${
            dragId.current === list.id ? "opacity-40" : ""
          }`}
        >
          {/* Drag handle */}
          <div className="cursor-grab active:cursor-grabbing flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>

          <Link
            href={`/admin/music/${list.id}/edit`}
            className="flex items-center gap-4 flex-1 min-w-0"
          >
            {/* Cover */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              {list.coverImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={list.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <ListMusic className="h-6 w-6 text-gray-300" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {list.title}
                </h3>
                <Badge variant={list.isPublished ? "success" : "outline"}>
                  {list.isPublished ? "Published" : "Draft"}
                </Badge>
                {list.listInBookstore && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600">
                    <Store className="h-2.5 w-2.5" /> Bookstore
                  </span>
                )}
              </div>
              {list.description && (
                <p className="text-xs text-gray-500 truncate mb-0.5">{list.description}</p>
              )}
              <p className="text-xs text-gray-500">
                {list.trackCount} track{list.trackCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>

          <FeaturedStarButton
            endpoint={`/api/admin/music/${list.id}/feature`}
            initialFeatured={list.isFeatured}
          />
        </div>
      ))}
    </div>
  );
}
