"use client";

import { useEffect, useState } from "react";
import { PenLine, Star, X } from "lucide-react";
import { BookFeedbackForm } from "@/components/author-site/book-feedback-form";

// The Reviews section of a book page: a rating summary, review cards, and a
// "Write a review" button that opens the rating form in a pop-up — so the page
// never shows a bare, always-open form (awkward when there are no reviews yet).

export type ReviewCard = {
  id: string;
  quote: string;
  reviewerName: string;
  /** Where an editorial pull-quote came from, e.g. "Kirkus". */
  source?: string | null;
  rating: number | null;
};

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export function BookReviews({
  reviews,
  averageRating,
  ratingCount,
  bookTitle,
  bookSlug,
  domain,
  accentColor,
}: {
  reviews: ReviewCard[];
  averageRating: number | null;
  ratingCount: number;
  bookTitle: string;
  bookSlug: string;
  domain: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const writeButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
      style={{ borderColor: accentColor, color: accentColor }}
    >
      <PenLine className="h-4 w-4" /> Write a review
    </button>
  );

  return (
    <>
      {reviews.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {averageRating !== null ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-gray-900 tabular-nums">{averageRating.toFixed(1)}</span>
                <div>
                  <Stars value={averageRating} />
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
                  </p>
                </div>
              </div>
            ) : (
              <span />
            )}
            {writeButton}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <figure key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                {r.rating !== null && <Stars value={r.rating} size="h-3.5 w-3.5" />}
                <blockquote className="mt-2 text-gray-700 leading-relaxed">&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-sm text-gray-500">
                  — <span className="font-medium text-gray-800">{r.reviewerName}</span>
                  {r.source && <span className="text-gray-400">, {r.source}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
          <div className="flex justify-center"><Stars value={0} size="h-6 w-6" /></div>
          <p className="mt-3 font-semibold text-gray-900">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Read <em>{bookTitle}</em>? Be the first to rate it.</p>
          {writeButton}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Review ${bookTitle}`}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Write a review</h2>
                <p className="text-sm text-gray-500">{bookTitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <BookFeedbackForm bookSlug={bookSlug} domain={domain} accentColor={accentColor} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
