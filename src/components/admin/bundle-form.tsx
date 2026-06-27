"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, X, Plus, GripVertical, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";

export interface BundleData {
  id?: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  priceCents: number;
  isPublished: boolean;
  saleItemIds: string[];
}

type SaleItemOption = {
  id: string;
  format: string;
  label: string;
  priceCents: number;
  bookTitle: string;
  bookCoverUrl: string | null;
};

interface BundleFormProps {
  initial?: Partial<BundleData>;
  mode: "create" | "edit";
}

export function BundleForm({ initial, mode }: BundleFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial?.priceCents ? (initial.priceCents / 100).toFixed(2) : ""
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [selectedItems, setSelectedItems] = useState<string[]>(initial?.saleItemIds ?? []);

  const [availableItems, setAvailableItems] = useState<SaleItemOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/bundles/sale-items")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableItems(data);
      })
      .catch(() => {});
  }, []);

  const individualTotal = availableItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.priceCents, 0);

  const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);
  const savings = individualTotal > 0 && priceCents < individualTotal
    ? Math.round(((individualTotal - priceCents) / individualTotal) * 100)
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        priceCents,
        isPublished,
        saleItemIds: selectedItems,
      };

      const url = mode === "edit" ? `/api/admin/bundles/${initial?.id}` : "/api/admin/bundles";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }

      router.push("/admin/bundles");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this bundle? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bundles/${initial?.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete");
        return;
      }
      router.push("/admin/bundles");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  function toggleItem(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="The Complete Fantasy Trilogy"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what's included in this bundle..."
        />
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://..."
        />
        {coverImageUrl && (
          <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Items Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bundle Items ({selectedItems.length} selected)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Select the book formats to include in this bundle.
        </p>

        {availableItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No sale items found.</p>
            <p className="text-xs text-gray-400 mt-1">Add direct sale items to your books first.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {availableItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {item.bookCoverUrl ? (
                    <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.bookCoverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-14 rounded bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.bookTitle}</p>
                    <p className="text-xs text-gray-500">{item.label} · {item.format}</p>
                  </div>
                  <span className="text-sm text-gray-600 flex-shrink-0">
                    {formatCents(item.priceCents)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Individual total:</span>
              <span>{formatCents(individualTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price ($)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
        {savings > 0 && (
          <p className="text-xs text-green-600 mt-1">
            {savings}% savings vs. buying individually
          </p>
        )}
      </div>

      {/* Published */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Published (visible on your site)
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === "create" ? "Create Bundle" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/bundles")}>
          Cancel
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
