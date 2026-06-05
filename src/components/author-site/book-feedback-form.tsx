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
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-green-800 font-medium">Thank you for your feedback!</p>
        <p className="text-green-700 text-sm mt-1">
          Your rating has been submitted and is pending review.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
        Leave Your Feedback
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
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
                  className={`h-7 w-7 transition-colors ${
                    n <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Share your thoughts about this book…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none resize-none bg-white"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
