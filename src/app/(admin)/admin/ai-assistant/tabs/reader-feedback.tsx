"use client";

import { useId, useRef, useState } from "react";
import { BarChart2, Loader2, Copy, Check, RotateCcw } from "lucide-react";

export function ReaderFeedbackTab() {
  const headingId = useId();

  const [feedback, setFeedback] = useState("");
  const [output,   setOutput]   = useState("");
  const [status,   setStatus]   = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied,   setCopied]   = useState(false);

  const abortRef    = useRef<AbortController | null>(null);
  const isStreaming = status === "streaming";

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutput("");
    setErrorMsg("");
    setStatus("streaming");

    try {
      const res = await fetch("/api/admin/ai/reader-feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ feedback }),
        signal:  controller.signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Analysis failed. Please try again.");
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
      <form onSubmit={handleAnalyze} aria-labelledby={headingId} noValidate className="space-y-5">
        <h2 id={headingId} className="text-base font-semibold text-gray-800">Reader Reviews</h2>

        {/* Feedback textarea */}
        <div className="space-y-1">
          <label htmlFor="rf-feedback" className="block text-sm font-medium text-gray-700">
            Reader Reviews / Feedback <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <textarea
            id="rf-feedback"
            name="feedback"
            rows={8}
            required
            aria-required="true"
            aria-describedby="rf-feedback-help"
            placeholder="Paste reader reviews, comments, or feedback here. You can include multiple reviews separated by lines…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
          />
          <p id="rf-feedback-help" className="text-xs text-gray-400">
            Paste reviews from Amazon, Goodreads, emails, or any source.
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
            disabled={isStreaming || !feedback.trim()}
            aria-label="Analyze the provided reader feedback"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
              : <><BarChart2 className="h-4 w-4" /> Analyze Feedback</>}
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

      {/* Output — rendered as formatted text */}
      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700">
              Analysis
              {isStreaming && <span aria-live="polite" className="ml-2 text-xs text-blue-500 font-normal">Analysing…</span>}
            </span>
            {status === "done" && output && (
              <button type="button" onClick={handleCopy}
                aria-label="Copy analysis to clipboard"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1">
                {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            )}
          </div>
          {/* Rendered as preformatted text to preserve markdown-style structure */}
          <div
            aria-live="polite"
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4
              text-sm text-gray-800 leading-relaxed shadow-sm whitespace-pre-wrap font-mono"
          >
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
