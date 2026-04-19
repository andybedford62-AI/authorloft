"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ResultBox } from "../../ai-assistant/tabs/result-box";

type Book = { id: string; title: string; slug: string; description: string | null };

const inputClass =
  "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm " +
  "placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none " +
  "focus:ring-2 focus:ring-blue-500/20 transition-shadow disabled:opacity-50";

export function KeywordDensityTab({ books }: { books: Book[] }) {
  const [useCustom,      setUseCustom]      = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [customContent,  setCustomContent]  = useState("");

  const [output,   setOutput]   = useState("");
  const [status,   setStatus]   = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const abortRef    = useRef<AbortController | null>(null);
  const isStreaming = status === "streaming";

  const selectedBook = books.find((b) => b.id === selectedBookId);

  async function handleAnalyse(e: React.FormEvent) {
    e.preventDefault();
    if (isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutput("");
    setErrorMsg("");
    setStatus("streaming");

    const content = useCustom
      ? customContent
      : `Title: ${selectedBook?.title ?? ""}\n${selectedBook?.description ?? ""}`.trim();

    try {
      const res = await fetch("/api/admin/ai/seo-keyword-density", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content }),
        signal:  controller.signal,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 402 && json.error === "limit_reached") {
          setErrorMsg("limit_reached");
        } else {
          throw new Error(json.error || "Analysis failed. Please try again.");
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

  const canSubmit = useCustom ? !!customContent.trim() : !!selectedBookId;

  return (
    <div className="space-y-4 p-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {([false, true] as const).map((custom) => (
          <button
            key={String(custom)}
            type="button"
            onClick={() => setUseCustom(custom)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              useCustom === custom
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {custom ? "Custom Content" : "Book Page"}
          </button>
        ))}
      </div>

      <form onSubmit={handleAnalyse} noValidate>
        {!useCustom ? (
          <div className="space-y-1.5">
            <label htmlFor="kd-book" className="block text-sm font-medium text-gray-700">
              Select Book <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <select
              id="kd-book"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            >
              <option value="">— Choose a book —</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="kd-content" className="block text-sm font-medium text-gray-700">
              Content to Analyse <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <textarea
              id="kd-content"
              rows={7}
              required
              aria-required="true"
              placeholder="Paste your page content here…"
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
              style={{ minHeight: "160px" }}
            />
          </div>
        )}

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
          disabled={isStreaming || !canSubmit}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
            bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
            : <><Sparkles className="w-4 h-4" /> Analyse Keyword Density</>}
        </button>
      </form>

      <ResultBox output={output} status={status} />
    </div>
  );
}
