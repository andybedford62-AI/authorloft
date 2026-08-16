"use client";

import { useState } from "react";

const NAVY_DEEP = "#050D1C";

export function CinematicNewsletterForm({
  authorId,
  accent,
}: {
  authorId: string;
  accent: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
        setMessage(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
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
      <p className="text-sm text-[#FBF6E9]/70 sm:col-start-1" style={{ color: accent }}>
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 px-5 py-3 rounded-full text-sm text-[#FBF6E9] placeholder-[#FBF6E9]/30 border outline-none focus:border-opacity-80 transition-colors"
        style={{
          background: NAVY_DEEP,
          borderColor: accent + "44",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: accent, color: NAVY_DEEP }}
      >
        {loading ? "Subscribing…" : "Subscribe →"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400 sm:col-span-2">{message}</p>
      )}
    </form>
  );
}
