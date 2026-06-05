"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface BookFeedbackFormProps {
  bookSlug: string;
  domain: string;
  accentColor: string;
}

export function BookFeedbackForm({ bookSlug, domain, accentColor }: BookFeedbackFormProps) {
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
      <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-center">
        <p className="text-green-800 text-sm font-medium">Thank you! Your feedback is pending review.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        Leave a Rating
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name + Email + Stars on one row (desktop) */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none bg-white"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none bg-white"
            />
          </div>
          <div className="shrink-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      n <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comment + Submit on one row */}
        <div className="flex gap-2 items-start">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Comment (optional)…"
            className="flex-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none resize-none bg-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 px-4 py-1.5 rounded text-sm font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90 self-end"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}
