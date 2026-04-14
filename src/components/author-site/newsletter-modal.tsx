"use client";

import { useState } from "react";
import { BookOpen, X, Mail } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const INTERESTS = [
  { value: "all",          label: "All" },
  { value: "new_releases", label: "New Releases" },
  { value: "specials",     label: "Specials & Offers" },
  { value: "blog",         label: "Blog Posts" },
];

const FREQUENCIES = [
  "Weekly",
  "Monthly",
  "Only major announcements",
];

const REFERRAL_OPTIONS = [
  "Social media",
  "Friend or family",
  "Search engine",
  "Book club",
  "Other",
];

// ── Types ────────────────────────────────────────────────────────────────────

interface ModalProps {
  authorId: string;
  accentColor: string;
  onClose: () => void;
}

// ── Modal (inner) ────────────────────────────────────────────────────────────

function NewsletterModal({ authorId, accentColor, onClose }: ModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [interests, setInterests] = useState<string[]>(["all"]);
  const [frequency, setFrequency] = useState("");
  const [howHeard,  setHowHeard]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  function toggleInterest(value: string) {
    if (value === "all") {
      setInterests(["all"]);
      return;
    }
    setInterests((prev) => {
      const without = prev.filter((v) => v !== "all");
      return without.includes(value)
        ? without.filter((v) => v !== value)
        : [...without, value];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || undefined;
      const categoryPrefs = interests.includes("all") ? [] : interests;

      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, name, email, categoryPrefs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">

        {/* Dark header */}
        <div className="relative bg-gray-900 px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4" style={{ color: accentColor }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Newsletter
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Stay in the Loop</h2>
          <p className="text-sm text-gray-400">
            Join readers getting the latest news, releases, and exclusive content.
          </p>
        </div>

        {/* White form body */}
        <div className="bg-white px-6 py-6">
          {success ? (
            <div className="text-center py-8">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: accentColor + "20" }}
              >
                <Mail className="h-7 w-7" style={{ color: accentColor }} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">You&apos;re subscribed!</h3>
              <p className="text-gray-500 text-sm mb-5">Thanks for joining the newsletter.</p>
              <button
                onClick={onClose}
                className="text-sm font-semibold hover:underline"
                style={{ color: accentColor }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((item) => {
                    const checked = interests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleInterest(item.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          checked
                            ? "text-white border-transparent"
                            : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                        }`}
                        style={checked ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                      >
                        {/* Checkbox indicator */}
                        <span
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                            checked ? "border-white bg-white/20" : "border-gray-300"
                          }`}
                        >
                          {checked && (
                            <svg viewBox="0 0 10 8" fill="none" className="w-2 h-2">
                              <path
                                d="M1 4l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Frequency{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent"
                >
                  <option value="">Weekly</option>
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Where did you hear */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Where did you hear about us?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={howHeard}
                  onChange={(e) => setHowHeard(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent"
                >
                  <option value="">Select an option...</option>
                  {REFERRAL_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? "Subscribing..." : "Subscribe Now"}
              </button>

              <p className="text-center text-xs text-gray-400">
                No spam. Unsubscribe any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Button + modal trigger (exported) ────────────────────────────────────────

export function NewsletterModalButton({
  authorId,
  accentColor,
}: {
  authorId: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        <Mail className="h-4 w-4" />
        Subscribe to Newsletter
      </button>

      {open && (
        <NewsletterModal
          authorId={authorId}
          accentColor={accentColor}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
