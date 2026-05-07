"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, CheckSquare, Square, Send } from "lucide-react";

const PLATFORM_OPTIONS = [
  { value: "AMAZON", label: "Amazon" },
  { value: "GOODREADS", label: "Goodreads" },
  { value: "BOOKBUB", label: "BookBub" },
  { value: "BLOG", label: "Blog / Website" },
  { value: "OTHER", label: "Other" },
];

type Props = {
  bookId: string;
  bookTitle: string;
  authorName: string;
  authorImage: string | null;
  bookCover: string | null;
  disclaimer: string;
};

export function ApplyClient({ bookId, bookTitle, authorName, authorImage, bookCover, disclaimer }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [blogUrl, setBlogUrl] = useState("");
  const [bio, setBio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function togglePlatform(value: string) {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("Please acknowledge the terms above."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/arc/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name: name.trim(), email: email.trim(), reviewPlatforms: platforms, blogUrl, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit application. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg px-8 py-10 text-center space-y-4">
          <div className="text-4xl">📬</div>
          <h1 className="text-xl font-bold text-gray-900">Application received!</h1>
          <p className="text-sm text-gray-500">
            Thanks for applying to read <strong>{bookTitle}</strong>. {authorName} will be in
            touch if you're selected.
          </p>
          <p className="text-xs text-gray-400">Keep an eye on your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e40af] px-8 py-6">
          <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">AuthorLoft</p>
          <h1 className="text-white text-xl font-bold">Request an Advance Copy</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Book info */}
          <div className="flex items-start gap-4">
            {bookCover ? (
              <Image
                src={bookCover}
                alt={bookTitle}
                width={56}
                height={80}
                className="rounded object-cover flex-shrink-0"
                style={{ width: 56, height: 80 }}
              />
            ) : (
              <div className="flex-shrink-0 w-14 h-20 bg-blue-100 rounded flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{bookTitle}</p>
              <p className="text-sm text-gray-500">by {authorName}</p>
              {authorImage && (
                <Image
                  src={authorImage}
                  alt={authorName}
                  width={24}
                  height={24}
                  className="rounded-full mt-2 object-cover"
                  style={{ width: 24, height: 24 }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@example.com"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Where do you post reviews?</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => togglePlatform(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    platforms.includes(opt.value)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Blog or social link (optional)</label>
            <input
              type="url"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              placeholder="https://yourblog.com"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tell us about yourself (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short note about your reading interests or reviewing experience…"
              rows={3}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 leading-relaxed">{disclaimer}</p>
          </div>

          <button
            type="button"
            onClick={() => setAgreed((v) => !v)}
            className="flex items-start gap-3 w-full text-left group"
          >
            <div className="flex-shrink-0 mt-0.5">
              {agreed ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 leading-snug">
              I agree to the terms above and will post an honest review.
            </p>
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting…" : "Apply for ARC"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by{" "}
            <a href="https://www.authorloft.com" className="text-gray-500 hover:underline">
              AuthorLoft
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
