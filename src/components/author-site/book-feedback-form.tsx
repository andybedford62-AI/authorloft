"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// The reader rating form. Lives inside the "Write a review" pop-up on the book
// page (see BookReviews), so it's laid out as a stacked form rather than an
// always-open strip on the page.

interface BookFeedbackFormProps {
  bookSlug: string;
  domain: string;
  accentColor: string;
  /** Called once the review is sent, e.g. so the pop-up can offer "Close". */
  onDone?: () => void;
}

export function BookFeedbackForm({ bookSlug, domain, accentColor, onDone }: BookFeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/books/${bookSlug}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          reviewerName: name.trim(),
          reviewerEmail: email.trim(),
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-4">
        <p className="text-gray-900 font-semibold">Thank you for your review!</p>
        <p className="text-sm text-gray-500">It will appear on this page once the author has approved it.</p>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Close
          </button>
        )}
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-1.5">
          Your rating <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          <p className="text-[11px] text-gray-400 mt-1">Never shown publicly.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your review <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="What did you think?"
          className={`${input} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        {submitting ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
