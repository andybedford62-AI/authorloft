"use client";

import { useState } from "react";
import { X, Loader2, Mail, CheckCircle } from "lucide-react";

type Props = {
  bookId: string;
  saleItemId: string;
  authorId: string;
  bookTitle: string;
  format: string;
  coverImageUrl?: string | null;
  accentColor: string;
  onClose: () => void;
};

export function ReaderMagnetModal({
  bookId,
  saleItemId,
  authorId,
  bookTitle,
  coverImageUrl,
  accentColor,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/author/reader-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, saleItemId, authorId, email, name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header strip */}
        <div className="px-6 pt-6 pb-4" style={{ backgroundColor: accentColor }}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt={bookTitle}
              className="w-16 h-24 object-cover rounded-lg shadow-lg mb-3 mx-auto block"
            />
          )}
          <h2 className="text-white font-bold text-lg text-center leading-snug">
            Get your free copy of
          </h2>
          <p className="text-white/90 font-semibold text-center mt-0.5">{bookTitle}</p>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="font-semibold text-gray-900">Check your inbox!</p>
              <p className="text-sm text-gray-500">
                Your download link is on its way to <strong>{email}</strong>.
                Keep the email — your link is valid for 7 days.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 inline-block px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Enter your email and we&rsquo;ll send your download link instantly — no spam, ever.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="sr-only">Your name (optional)</label>
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                    style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="sr-only">Email address</label>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                    style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Send My Free Copy</>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  You&rsquo;ll also be subscribed to the author&rsquo;s newsletter. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
