"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Mail } from "lucide-react";

interface NewsletterFormProps {
  authorId: string;
  authorSlug: string;
  accentColor: string;
  genres?: { id: string; name: string }[];
  /** Compact mode: name + email side-by-side inline, no genre chips */
  compact?: boolean;
  /** Dark mode: white inputs on a dark background (used by Bold template) */
  darkMode?: boolean;
}

export function NewsletterForm({ authorId, authorSlug, accentColor, genres = [], compact = false, darkMode = false }: NewsletterFormProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const data = {
      authorId,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      categoryPrefs: selectedGenres,
    };

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  function toggleGenre(id: string) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  if (state === "success") {
    if (compact) {
      return (
        <div className="flex items-center justify-center gap-2 py-3 text-white">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium text-sm">You&apos;re on the list!</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className={`h-10 w-10 ${darkMode ? "text-white" : "text-green-500"}`} />
        <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>You&apos;re on the list!</p>
        <p className={`text-sm ${darkMode ? "text-white/70" : "text-gray-500"}`}>
          Thank you for subscribing. Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  // ── Compact footer version ────────────────────────────────────────────────
  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2"
        style={{ "--accent": accentColor } as React.CSSProperties}
      >
        <input
          name="name"
          placeholder="Your name"
          required
          className="flex-1 rounded-lg px-4 py-2.5 text-sm bg-white/15 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/70 focus:bg-white/20"
        />
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          className="flex-1 rounded-lg px-4 py-2.5 text-sm bg-white/15 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/70 focus:bg-white/20"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-sm font-semibold transition-opacity disabled:opacity-60 flex-shrink-0"
          style={{ color: accentColor }}
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Subscribe
            </>
          )}
        </button>
        {state === "error" && (
          <p className="w-full text-xs text-white/80 mt-1">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    );
  }

  const inputClass = darkMode
    ? "block w-full rounded-md border border-white/20 bg-white/10 text-white placeholder:text-white/50 px-3 py-2 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15"
    : undefined;

  // ── Full version ─────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {darkMode ? (
          <>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">Your Name</label>
              <input name="name" placeholder="Jane Reader" required className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">Email Address</label>
              <input name="email" type="email" placeholder="jane@example.com" required className={inputClass} />
            </div>
          </>
        ) : (
          <>
            <Input label="Your Name" name="name" placeholder="Jane Reader" required />
            <Input label="Email Address" name="email" type="email" placeholder="jane@example.com" required />
          </>
        )}
      </div>

      {genres.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${darkMode ? "text-white/80" : "text-gray-700"}`}>
            What are you interested in?{" "}
            <span className={`font-normal ${darkMode ? "text-white/50" : "text-gray-400"}`}>(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedGenres.includes(genre.id)
                    ? darkMode
                      ? "bg-white text-gray-900 border-white"
                      : "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : darkMode
                      ? "bg-white/10 text-white/80 border-white/20 hover:border-white/60"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[var(--accent)]"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {state === "error" && (
        <p className={`text-sm ${darkMode ? "text-white/80" : "text-red-600"}`}>
          Something went wrong. Please try again.
        </p>
      )}

      <Button
        type="submit"
        disabled={state === "loading"}
        className={darkMode ? "bg-white text-gray-900 hover:bg-white/90 font-semibold" : ""}
        style={darkMode ? {} : undefined}
      >
        {state === "loading" ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subscribing...</>
        ) : (
          <><Mail className="h-4 w-4 mr-2" />Sign Up for Newsletter</>
        )}
      </Button>
    </form>
  );
}
