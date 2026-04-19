"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ResultBox } from "./result-box";

const CHANNELS = [
  "Social Media",
  "Email Newsletter",
  "Amazon / Retailer Page",
  "Press Release",
  "Author Website",
];

export function MarketingCopyTab() {
  const [bookTitle, setBookTitle] = useState("");
  const [genre,     setGenre]     = useState("");
  const [hook,      setHook]      = useState("");
  const [channel,   setChannel]   = useState("Social Media");

  const [output,   setOutput]   = useState("");
  const [status,   setStatus]   = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const abortRef    = useRef<AbortController | null>(null);
  const isStreaming = status === "streaming";

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutput("");
    setErrorMsg("");
    setStatus("streaming");

    try {
      const res = await fetch("/api/admin/ai/marketing-copy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookTitle, genre, hook, channel }),
        signal:  controller.signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 402 && json.error === "limit_reached") {
          setErrorMsg("limit_reached");
        } else {
          throw new Error(json.error || "Generation failed. Please try again.");
        }
        setStatus("error");
        return;
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setStatus("done");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const inputClass =
    "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm " +
    "placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none " +
    "focus:ring-2 focus:ring-blue-500/20 transition-shadow disabled:opacity-50";

  return (
    <div className="space-y-4">
      <form onSubmit={handleGenerate} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <label htmlFor="mc-title" className="block text-sm font-medium text-gray-700">
              Book Title <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="mc-title"
              type="text"
              required
              aria-required="true"
              placeholder="e.g. Echoes of Tomorrow"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mc-genre" className="block text-sm font-medium text-gray-700">Genre</label>
            <input
              id="mc-genre"
              type="text"
              placeholder="e.g. Sci-Fi Thriller"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mc-hook" className="block text-sm font-medium text-gray-700">
              Core Hook / Key Message
            </label>
            <input
              id="mc-hook"
              type="text"
              placeholder="e.g. What if you could relive your worst mistake?"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mc-channel" className="block text-sm font-medium text-gray-700">
              Primary Channel
            </label>
            <select
              id="mc-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {status === "error" && (
          errorMsg === "limit_reached" ? (
            <div role="alert" aria-live="polite"
              className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              You've reached your monthly AI request limit.{" "}
              <a href="/admin/settings" className="font-semibold underline hover:text-amber-900 cursor-pointer">
                Add your own Gemini API key in Settings
              </a>{" "}
              to continue with no limits.
            </div>
          ) : (
            <div role="alert" aria-live="polite"
              className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errorMsg}
            </div>
          )
        )}

        <button
          type="submit"
          disabled={isStreaming || !bookTitle.trim()}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
            bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Sparkles className="w-4 h-4" /> Generate Marketing Copy</>}
        </button>
      </form>

      <ResultBox output={output} status={status} />
    </div>
  );
}
