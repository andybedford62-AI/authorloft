"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ResultBox } from "../../ai-assistant/tabs/result-box";

type Book = { id: string; title: string; slug: string; description: string | null };

const inputClass =
  "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm " +
  "placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none " +
  "focus:ring-2 focus:ring-blue-500/20 transition-shadow disabled:opacity-50";

export function InternalLinksTab({ books }: { books: Book[] }) {
  const [focusPage, setFocusPage] = useState("");

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
      const res = await fetch("/api/admin/ai/seo-internal-links", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          focusPage,
          books: books.map((b) => ({ title: b.title, slug: b.slug })),
        }),
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

  return (
    <div className="space-y-4 p-6">
      <form onSubmit={handleGenerate} noValidate>
        <div className="space-y-1.5">
          <label htmlFor="il-page" className="block text-sm font-medium text-gray-700">
            Describe the Page You're Optimising{" "}
            <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <textarea
            id="il-page"
            rows={5}
            required
            aria-required="true"
            aria-describedby="il-page-hint"
            placeholder="e.g. Book detail page for 'The Last Meridian' — a WWII historical fiction novel about a French resistance fighter. Currently has synopsis and purchase links but no internal links to other books or the author bio."
            value={focusPage}
            onChange={(e) => setFocusPage(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
            style={{ minHeight: "120px" }}
          />
          <p id="il-page-hint" className="text-xs text-gray-400">
            Describe the page type, content, and any known gaps.
          </p>
        </div>

        {books.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {books.length} book{books.length !== 1 ? "s" : ""} on your site will be included as linking targets.
          </p>
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
          disabled={isStreaming || !focusPage.trim()}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
            bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Sparkles className="w-4 h-4" /> Suggest Internal Links</>}
        </button>
      </form>

      <ResultBox output={output} status={status} />
    </div>
  );
}
