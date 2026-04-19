"use client";

import { useEffect, useState } from "react";
import { Quote, Star, Plus, Trash2, Pencil, Loader2, GripVertical, X, Check } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";

interface Review {
  id: string;
  quote: string;
  reviewerName: string;
  source: string | null;
  rating: number | null;
  sortOrder: number;
}

interface Props {
  bookId: string;
}

const EMPTY: Omit<Review, "id" | "sortOrder"> = {
  quote: "",
  reviewerName: "",
  source: "",
  rating: null,
};

export function BookReviews({ bookId }: Props) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState("");
  const [editing, setEditing]   = useState<string | null>(null); // review id or "new"
  const [form,    setForm]      = useState(EMPTY);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/admin/books/${bookId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [bookId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function startNew() {
    setForm(EMPTY);
    setEditing("new");
    setError("");
  }

  function startEdit(r: Review) {
    setForm({ quote: r.quote, reviewerName: r.reviewerName, source: r.source ?? "", rating: r.rating });
    setEditing(r.id);
    setError("");
  }

  function cancel() {
    setEditing(null);
    setError("");
  }

  async function save() {
    if (!form.quote.trim() || !form.reviewerName.trim()) {
      setError("Quote and reviewer name are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing === "new") {
        const res = await fetch(`/api/admin/books/${bookId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, sortOrder: reviews.length }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        const { review } = await res.json();
        setReviews((prev) => [...prev, review]);
      } else {
        const res = await fetch(`/api/admin/books/${bookId}/reviews`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewId: editing, ...form }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        const { review } = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === review.id ? review : r)));
      }
      setEditing(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/admin/books/${bookId}/reviews?reviewId=${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete review.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Reviews &amp; Pull Quotes</h2>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Review
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Add quotes from reviews and readers. They'll appear as pull quotes on your book's public page.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}

      {/* Review list */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              {editing === r.id ? (
                <ReviewForm
                  form={form}
                  setForm={setForm}
                  onSave={save}
                  onCancel={cancel}
                  saving={saving}
                />
              ) : (
                <div className="flex gap-3">
                  <GripVertical className="h-4 w-4 text-gray-300 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {r.rating && <StarRating value={r.rating} />}
                    <p className="text-sm text-gray-700 italic leading-relaxed mt-1">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5">
                      — {r.reviewerName}
                      {r.source && <span className="text-gray-400">, {r.source}</span>}
                    </p>
                  </div>
                  <div className="flex items-start gap-1 flex-shrink-0">
                    <IconButton icon={<Pencil className="h-4 w-4" />} title="Edit review" variant="ghost" onClick={() => startEdit(r)} />
                    <IconButton icon={<Trash2 className="h-4 w-4" />} title="Delete review" variant="ghost" onClick={() => remove(r.id)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New review form */}
      {editing === "new" && (
        <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
          <ReviewForm
            form={form}
            setForm={setForm}
            onSave={save}
            onCancel={cancel}
            saving={saving}
          />
        </div>
      )}

      {!loading && reviews.length === 0 && editing === null && (
        <p className="text-sm text-gray-400 text-center py-4">
          No reviews yet — add your first pull quote above.
        </p>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function ReviewForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  form: Omit<Review, "id" | "sortOrder">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Review, "id" | "sortOrder">>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Quote *</label>
        <textarea
          rows={3}
          value={form.quote}
          onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
          placeholder="An amazing read that I couldn't put down…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer Name *</label>
          <input
            type="text"
            value={form.reviewerName}
            onChange={(e) => setForm((p) => ({ ...p, reviewerName: e.target.value }))}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
          <input
            type="text"
            value={form.source ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
            placeholder="Goodreads, Amazon…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rating (optional)</label>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm((p) => ({ ...p, rating: n === 0 ? null : n }))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                (form.rating ?? 0) === n
                  ? "bg-amber-400 border-amber-400 text-white"
                  : "border-gray-200 text-gray-500 hover:border-amber-300"
              }`}
            >
              {n === 0 ? "None" : `${n}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save Review
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
