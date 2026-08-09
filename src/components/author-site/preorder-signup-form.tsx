"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

interface PreOrderSignupFormProps {
  bookSlug: string;
  domain: string;
  accentColor: string;
  launchLabel: string | null; // formatted date string, or null for "Coming Soon"
}

export function PreOrderSignupForm({ bookSlug, domain, accentColor, launchLabel }: PreOrderSignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/books/${bookSlug}/preorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email: email.trim(), name: name.trim() || undefined }),
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

  return (
    <div id="buy" className="rounded-xl border-2 p-5" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0d` }}>
      <div className="flex items-center gap-2 mb-1">
        <Bell className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
        <p className="text-sm font-bold" style={{ color: accentColor }}>
          {launchLabel ? `Coming ${launchLabel}` : "Coming Soon"}
        </p>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        This book isn't available yet. Sign up and we'll email you the moment it launches.
      </p>

      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          You're on the list — we'll email you when it's available.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none bg-white"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
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
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 px-4 py-1.5 rounded text-sm font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? "Saving…" : "Notify Me"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
