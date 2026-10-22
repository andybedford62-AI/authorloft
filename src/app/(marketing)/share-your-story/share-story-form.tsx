"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Check } from "lucide-react";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";

const MAX_QUOTE = 1200;

export function ShareStoryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/marketing/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, quote, consent, website }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full border border-[rgba(243,236,219,0.15)] rounded-[6px] px-3 py-2.5 text-sm text-[#f3ecdb] placeholder-[#93a0bc] bg-[#16233d] focus:outline-none focus:ring-2 focus:ring-[#d6a94a] focus:border-transparent";

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingPageHeader
        eyebrow="Your story"
        title={<>Share your <span className="italic text-[#d6a94a]">AuthorLoft</span> story</>}
        subtitle="A few honest sentences about what you've done with AuthorLoft helps other authors decide. A specific result beats a compliment."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {sent ? (
          <div className="bg-[#1e2f4d] border border-[rgba(243,236,219,0.12)] rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#243756] flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-[#d6a94a]" />
            </div>
            <h2 className="text-xl font-bold text-[#f3ecdb] mb-2">Thank you!</h2>
            <p className="text-[#93a0bc] mb-6">
              We read every one. Before anything goes on the site we&apos;ll check it, and if we&apos;d like to add your photo we&apos;ll email you at <strong>{email}</strong>.
            </p>
            <Link href="/" className="text-sm text-[#93a0bc] hover:text-[#f3ecdb] transition-colors">
              ← Back to AuthorLoft home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-[#1e2f4d] border border-[rgba(243,236,219,0.12)] rounded-2xl p-6 sm:p-8">
            {error && (
              <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="story-name" className="block text-sm font-medium text-[#f3ecdb]">
                  Your name <span className="text-red-400">*</span>
                </label>
                <input id="story-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required maxLength={100} autoComplete="name" className={inputClass} />
                <p className="text-xs text-[#93a0bc]">Shown with your testimonial.</p>
              </div>
              <div className="space-y-1">
                <label htmlFor="story-role" className="block text-sm font-medium text-[#f3ecdb]">How you&apos;d like to be described</label>
                <input id="story-role" type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Fantasy author, 3 books" maxLength={100} className={inputClass} />
                <p className="text-xs text-[#93a0bc]">For example a genre and how many books, courses or albums.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="story-email" className="block text-sm font-medium text-[#f3ecdb]">
                Email address <span className="text-red-400">*</span>
              </label>
              <input id="story-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required autoComplete="email" className={inputClass} />
              <p className="text-xs text-[#93a0bc]">Never shown publicly. Only used if we need to check something with you.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="story-quote" className="block text-sm font-medium text-[#f3ecdb]">
                Your story <span className="text-red-400">*</span>
              </label>
              <textarea
                id="story-quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={6}
                maxLength={MAX_QUOTE}
                required
                placeholder="What did you set up, and what changed? For example a first direct sale, readers added to your list, or hours saved."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-[#93a0bc] text-right">{quote.length}/{MAX_QUOTE}</p>
            </div>

            {/* Honeypot: hidden from people, tempting to bots. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
              <label htmlFor="story-website">Website</label>
              <input id="story-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <label className="flex items-start gap-3 text-sm text-[#c7cede] cursor-pointer min-h-11">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1 h-4 w-4 accent-[#d6a94a]" />
              <span>
                I agree AuthorLoft may publish this testimonial and my name on its website and marketing. I can ask to have it removed at any time.
              </span>
            </label>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-11 rounded-[6px] bg-[#d6a94a] hover:bg-[#e2bc6e] text-[#16233d] text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {sending ? "Sending…" : <><Send className="h-4 w-4" /> Send my story</>}
            </button>
          </form>
        )}

        <div className="mt-10 text-sm text-[#93a0bc] flex gap-6">
          <Link href="/privacy" className="hover:text-[#f3ecdb] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#f3ecdb] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
