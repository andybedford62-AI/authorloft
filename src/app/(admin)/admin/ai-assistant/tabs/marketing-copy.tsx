"use client";

import { useId, useRef, useState } from "react";
import { Sparkles, Loader2, Copy, Check, RotateCcw } from "lucide-react";

const CHANNELS = [
  "Social Media",
  "Email Newsletter",
  "Amazon/Retail Page",
  "Press Release",
  "Author Website",
];

export function MarketingCopyTab() {
  const headingId = useId();

  const [bookTitle, setBookTitle] = useState("");
  const [genre,     setGenre]     = useState("");
  const [hook,      setHook]      = useState("");
  const [channel,   setChannel]   = useState("Social Media");

  const [output,   setOutput]   = useState("");
  const [status,   setStatus]   = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied,   setCopied]   = useState(false);

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
        throw new Error(json.error || "Generation failed. Please try again.");
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

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    abortRef.current?.abort();
    setOutput("");
    setErrorMsg("");
    setStatus("idle");
  }

  const inputClass =
    "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm " +
    "placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none " +
    "focus:ring-2 focus:ring-blue-500/20 transition-shadow disabled:opacity-50";

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleGenerate} aria-labelledby={headingId} noValidate className="space-y-5">
        <h2 id={headingId} className="text-base font-semibold text-gray-800">Book & Channel Details</h2>

        {/* Book Title + Genre */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="mkt-book-title" className="block text-sm font-medium text-gray-700">
              Book Title <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="mkt-book-title"
              name="bookTitle"
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

          <div className="space-y-1">
            <label htmlFor="mkt-genre" className="block text-sm font-medium text-gray-700">Genre</label>
            <input
              id="mkt-genre"
              name="genre"
              type="text"
              placeholder="e.g. Sci-Fi Thriller"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
          </div>
        </div>

        {/* Core Hook */}
        <div className="space-y-1">
          <label htmlFor="mkt-hook" className="block text-sm font-medium text-gray-700">
            Core Hook / Key Message
          </label>
          <input
            id="mkt-hook"
            name="hook"
            type="text"
            aria-describedby="mkt-hook-help"
            placeholder="e.g. What if you could relive your worst mistake?"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
          />
          <p id="mkt-hook-help" className="text-xs text-gray-400">
            The central idea or tagline that makes your book irresistible.
          </p>
        </div>

        {/* Primary Channel */}
        <div className="space-y-1">
          <label htmlFor="mkt-channel" className="block text-sm font-medium text-gray-700">
            Primary Channel
          </label>
          <select
            id="mkt-channel"
            name="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={isStreaming}
            aria-describedby="mkt-channel-help"
            className={inputClass}
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p id="mkt-channel-help" className="text-xs text-gray-400">
            The AI will tailor the copy format and tone to the selected channel.
          </p>
        </div>

        {/* Error */}
        {status === "error" && (
          <div role="alert" aria-live="polite"
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isStreaming || !bookTitle.trim()}
            aria-label="Generate marketing copy based on the entered information"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              : <><Sparkles className="h-4 w-4" /> Generate Marketing Copy</>}
          </button>

          {(status === "done" || status === "streaming") && (
            <button type="button" onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset</span>
            </button>
          )}
        </div>
      </form>

      {/* Output */}
      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="mkt-output" className="block text-sm font-medium text-gray-700">
              Generated Copy — {channel}
              {isStreaming && <span aria-live="polite" className="ml-2 text-xs text-blue-500 font-normal">Writing…</span>}
            </label>
            {status === "done" && output && (
              <button type="button" onClick={handleCopy}
                aria-label="Copy generated marketing copy to clipboard"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1">
                {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            )}
          </div>
          <textarea
            id="mkt-output"
            readOnly
            rows={12}
            aria-live="polite"
            value={output}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3
              text-sm text-gray-800 leading-relaxed shadow-sm resize-y
              focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}
    </div>
  );
}
