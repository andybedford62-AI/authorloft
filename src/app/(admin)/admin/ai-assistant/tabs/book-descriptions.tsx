"use client";

import { useId, useRef, useState } from "react";
import { Sparkles, Loader2, Copy, Check, RotateCcw } from "lucide-react";

export function BookDescriptionsTab() {
  const headingId = useId();
  const errorId   = useId();
  const outputId  = useId();

  const [bookTitle, setBookTitle] = useState("");
  const [genre,     setGenre]     = useState("");
  const [themes,    setThemes]    = useState("");
  const [audience,  setAudience]  = useState("");

  const [output,    setOutput]    = useState("");
  const [status,    setStatus]    = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg,  setErrorMsg]  = useState("");
  const [copied,    setCopied]    = useState(false);

  const abortRef = useRef<AbortController | null>(null);

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
      const res = await fetch("/api/admin/ai/book-description", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookTitle, genre, themes, audience }),
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

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleGenerate}
        aria-labelledby={headingId}
        noValidate
        className="space-y-5"
      >
        <h2 id={headingId} className="text-base font-semibold text-gray-800">
          Book Details
        </h2>

        {/* Book Title + Genre row */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Book Title */}
          <div className="space-y-1">
            <label htmlFor="book-title" className="block text-sm font-medium text-gray-700">
              Book Title <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="book-title"
              name="bookTitle"
              type="text"
              autoComplete="off"
              required
              aria-required="true"
              aria-describedby="book-title-help"
              placeholder="e.g. The Last Meridian"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
            <p id="book-title-help" className="text-xs text-gray-400">
              Enter the full title of your book.
            </p>
          </div>

          {/* Genre */}
          <div className="space-y-1">
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <input
              id="genre"
              name="genre"
              type="text"
              autoComplete="off"
              aria-describedby="genre-help"
              placeholder="e.g. Literary Fiction"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
            <p id="genre-help" className="text-xs text-gray-400">
              Specify the primary genre or leave blank if unsure.
            </p>
          </div>
        </div>

        {/* Key Themes */}
        <div className="space-y-1">
          <label htmlFor="themes" className="block text-sm font-medium text-gray-700">
            Key Themes or Plot Points
          </label>
          <textarea
            id="themes"
            name="themes"
            rows={4}
            aria-multiline="true"
            aria-describedby="themes-help"
            placeholder="e.g. Identity, loss, redemption — a soldier returns home to find his family torn apart…"
            value={themes}
            onChange={(e) => setThemes(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
          />
          <p id="themes-help" className="text-xs text-gray-400">
            List major themes or plot elements. Short phrases are fine.
          </p>
        </div>

        {/* Target Audience */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
              Target Audience
            </label>
            <textarea
              id="audience"
              name="audience"
              rows={3}
              aria-describedby="audience-help"
              placeholder="e.g. Adult readers, fans of Cormac McCarthy"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
            <p id="audience-help" className="text-xs text-gray-400">
              Describe who the book is intended for.
            </p>
          </div>
        </div>

        {/* Error */}
        {status === "error" && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
          >
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            id="generate"
            disabled={isStreaming || !bookTitle.trim()}
            aria-label="Generate book descriptions based on the entered information"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Descriptions</>
            )}
          </button>

          {(status === "done" || status === "streaming") && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors
                focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset form and output</span>
            </button>
          )}
        </div>
      </form>

      {/* ── Output ───────────────────────────────────────────────────────────── */}
      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={outputId}
              className="block text-sm font-medium text-gray-700"
            >
              Generated Description
              {isStreaming && (
                <span aria-live="polite" className="ml-2 text-xs text-blue-500 font-normal">
                  Writing…
                </span>
              )}
            </label>
            {status === "done" && output && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy generated description to clipboard"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500
                  hover:text-gray-800 transition-colors focus:outline-none
                  focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            )}
          </div>
          <textarea
            id={outputId}
            readOnly
            rows={10}
            aria-live="polite"
            aria-label="Generated book description"
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
