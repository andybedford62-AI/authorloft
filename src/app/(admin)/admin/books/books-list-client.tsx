"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Pencil, Star, BookOpen, ShoppingCart, ExternalLink, GripVertical } from "lucide-react";

type BookRow = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  caption: string | null;
  series: { name: string } | null;
  _count: { directSaleItems: number; retailerLinks: number };
};

export function BooksListClient({ initialBooks }: { initialBooks: BookRow[] }) {
  const [books, setBooks]       = useState<BookRow[]>(initialBooks);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const dragId  = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  function handleDragStart(id: string) {
    dragId.current = id;
  }

  function handleDragEnter(id: string) {
    dragOver.current = id;
    if (dragId.current === id) return;
    setBooks((prev) => {
      const list  = [...prev];
      const from  = list.findIndex((b) => b.id === dragId.current);
      const to    = list.findIndex((b) => b.id === id);
      if (from === -1 || to === -1) return prev;
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return list;
    });
  }

  function handleDragEnd() {
    dragId.current  = null;
    dragOver.current = null;
    saveOrder();
  }

  async function saveOrder() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/books/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: books.map((b) => b.id) }),
      });
      setSaveMsg(res.ok ? "Order saved" : "Could not save order");
    } catch {
      setSaveMsg("Network error saving order");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Hint bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-400">
        <span>Drag <GripVertical className="inline h-3 w-3" /> to reorder · the top 3 published books appear on your homepage</span>
        {saving && <span className="text-blue-500 animate-pulse">Saving…</span>}
        {saveMsg && !saving && <span className="text-green-600">{saveMsg}</span>}
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-8 px-3 py-3" />
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Book
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Series
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Selling
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {books.map((book, idx) => (
            <tr
              key={book.id}
              draggable
              onDragStart={() => handleDragStart(book.id)}
              onDragEnter={() => handleDragEnter(book.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`hover:bg-gray-50 transition-colors ${
                dragId.current === book.id ? "opacity-40" : ""
              }`}
            >
              {/* Drag handle + position */}
              <td className="px-3 py-4">
                <div className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-gray-300 hover:text-gray-500 transition-colors" />
                  {idx < 3 && (
                    <span className="text-[10px] font-bold text-white bg-[var(--accent,#7B2D2D)] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {idx + 1}
                    </span>
                  )}
                </div>
              </td>

              {/* Title + cover */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-11 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-gray-900 line-clamp-1">{book.title}</p>
                      {book.isFeatured && (
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                      {book.caption && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium leading-none">
                          {book.caption}
                        </span>
                      )}
                    </div>
                    {book.subtitle && (
                      <p className="text-xs text-gray-400 line-clamp-1">{book.subtitle}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* Series */}
              <td className="px-4 py-4 hidden sm:table-cell">
                {book.series ? (
                  <span className="text-gray-600 text-xs">{book.series.name}</span>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>

              {/* Selling */}
              <td className="px-4 py-4 hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {book._count.directSaleItems > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      <ShoppingCart className="h-2.5 w-2.5" />
                      {book._count.directSaleItems} direct
                    </span>
                  )}
                  {book._count.retailerLinks > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {book._count.retailerLinks} retailer{book._count.retailerLinks !== 1 ? "s" : ""}
                    </span>
                  )}
                  {book._count.directSaleItems === 0 && book._count.retailerLinks === 0 && (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-4 hidden lg:table-cell">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  book.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {book.isPublished ? "Published" : "Draft"}
                </span>
              </td>

              {/* Edit */}
              <td className="px-4 py-4">
                <div className="flex items-center justify-end">
                  <Link href={`/admin/books/${book.id}/edit`}>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
