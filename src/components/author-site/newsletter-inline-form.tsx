"use client";

import { useState } from "react";
import { readableTextOn } from "@/lib/color-contrast";

// Inline email capture for the homepage newsletter section. Shared by all four
// templates so the subscribe behaviour can't drift between them -- each template
// supplies its own section chrome (heading, background, copy) and passes the
// styling props below to match its own visual language.
//
// Subscribes to the AUTHOR's list, not AuthorLoft's: POSTs the author's own id
// to the same per-author double opt-in endpoint the footer's
// NewsletterModalButton uses. Readers confirm by email before they're counted.

interface Props {
  authorId: string;
  accentColor: string;
  /** Surface the form sits on — drives input background and text colours. */
  tone?: "light" | "dark";
  /** Pill (Cinematic) vs. softened rectangle (Classic/Bold/Minimal). */
  rounded?: "full" | "lg";
  /** Explicit input background, when a template's surface needs an exact value. */
  inputBg?: string;
  /** Explicit button label colour, overriding the readability calculation. */
  buttonTextColor?: string;
}

export function NewsletterInlineForm({
  authorId,
  accentColor,
  tone = "light",
  rounded = "lg",
  inputBg,
  buttonTextColor,
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isDark = tone === "dark";
  const radius = rounded === "full" ? "9999px" : "10px";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        );
        return;
      }
      setStatus("success");
      setMessage(
        data.alreadyConfirmed
          ? "You're already subscribed."
          : "Check your inbox to confirm your subscription."
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <p
        className="text-sm font-medium"
        style={{ color: isDark ? accentColor : accentColor }}
      >
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor={`newsletter-email-${authorId}`}>
          Your email address
        </label>
        <input
          id={`newsletter-email-${authorId}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={`flex-1 px-5 py-3 text-sm border outline-none transition-colors focus:border-opacity-80 ${
            isDark
              ? "text-[#FBF6E9] placeholder-[#FBF6E9]/30"
              : "text-gray-900 placeholder-gray-400"
          }`}
          style={{
            background: inputBg ?? (isDark ? "rgba(255,255,255,0.04)" : "#fff"),
            borderColor: accentColor + (isDark ? "44" : "55"),
            borderRadius: radius,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
          style={{
            background: accentColor,
            color: buttonTextColor ?? readableTextOn(accentColor),
            borderRadius: radius,
          }}
        >
          {loading ? "Subscribing…" : "Subscribe →"}
        </button>
      </form>
      {status === "error" && (
        <p className={`text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <p className={`text-xs ${isDark ? "text-[#FBF6E9]/40" : "text-gray-400"}`}>
        No spam. Unsubscribe any time.
      </p>
    </div>
  );
}
