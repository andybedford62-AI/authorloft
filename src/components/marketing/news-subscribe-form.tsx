"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Mail } from "lucide-react";

interface NewsSubscribeFormProps {
  /** Where the signup originated — stored for analytics. */
  source: "news" | "footer" | "home";
  /** "box" = full panel (news page / home); "compact" = inline row (footer). */
  variant?: "box" | "compact";
  /** Light-on-dark styling for dark backgrounds. */
  darkMode?: boolean;
}

export function NewsSubscribeForm({ source, variant = "box", darkMode = false }: NewsSubscribeFormProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/news/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAlreadyConfirmed(!!data.alreadyConfirmed);
      setState("success");
    } catch {
      setState("error");
    }
  }

  // ── Compact (footer) ──────────────────────────────────────────────────────
  if (variant === "compact") {
    if (state === "success") {
      return (
        <div className="flex items-center gap-2 text-sm text-[#5C6E89]">
          <CheckCircle className="h-4 w-4 text-green-600" />
          {alreadyConfirmed ? "You're already subscribed — thanks!" : "Check your email to confirm!"}
        </div>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="rounded-lg px-3 py-2 text-sm bg-white border border-[#DCDBD3] text-[#1B2B47] placeholder-[#9b8e7e] focus:outline-none focus:border-[#5C6E89] min-w-0 sm:w-56"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B2B47] text-white text-sm font-medium hover:bg-[#27406B] transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Subscribe
        </button>
        {state === "error" && <p className="text-xs text-red-600 sm:hidden">Something went wrong. Try again.</p>}
      </form>
    );
  }

  // ── Box (news page / home) ────────────────────────────────────────────────
  const success = state === "success";
  const onDark = darkMode;

  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 ${
        onDark ? "bg-[#1B2B47] text-white" : "bg-[#C5D3E6] text-[#1B2B47]"
      }`}
    >
      {success ? (
        <div className="flex flex-col items-center text-center gap-2 py-2">
          <CheckCircle className={`h-8 w-8 ${onDark ? "text-[#D4AE6A]" : "text-green-600"}`} />
          <p className="font-serif text-xl">{alreadyConfirmed ? "You're already on the list!" : "Almost there!"}</p>
          <p className={`text-sm ${onDark ? "text-[#D4DDEB]" : "text-[#5C6E89]"}`}>
            {alreadyConfirmed
              ? "Thanks for subscribing to AuthorLoft News. We'll keep you posted."
              : "Check your inbox and click the confirmation link to start receiving AuthorLoft News."}
          </p>
        </div>
      ) : (
        <>
          <h3 className="font-serif text-xl sm:text-2xl mb-1">Get AuthorLoft News in your inbox</h3>
          <p className={`text-sm mb-4 ${onDark ? "text-[#D4DDEB]" : "text-[#5C6E89]"}`}>
            Product updates, new features, specials, and events — no spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none ${
                onDark
                  ? "bg-white/15 text-white placeholder-white/60 border border-white/30 focus:border-white/70"
                  : "bg-white text-[#1B2B47] placeholder-[#9b8e7e] border border-[#A9BDD6] focus:border-[#5C6E89]"
              }`}
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex-shrink-0 ${
                onDark ? "bg-[#B8893D] text-[#1B2B47] hover:bg-[#D4AE6A]" : "bg-[#1B2B47] text-white hover:bg-[#27406B]"
              }`}
            >
              {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Subscribe
            </button>
          </form>
          {state === "error" && (
            <p className={`text-xs mt-2 ${onDark ? "text-red-300" : "text-red-600"}`}>
              Something went wrong. Please try again.
            </p>
          )}
          <p className={`text-xs mt-3 ${onDark ? "text-[#D4DDEB]/70" : "text-[#5C6E89]/80"}`}>
            By subscribing you agree to our{" "}
            <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>.
          </p>
        </>
      )}
    </div>
  );
}
