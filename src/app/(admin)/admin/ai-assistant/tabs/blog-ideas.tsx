"use client";

import { useId, useRef, useState } from "react";
import { Sparkles, Loader2, Copy, Check, RotateCcw } from "lucide-react";

const TONES = ["Professional", "Casual", "Inspirational", "Humorous", "Storytelling", "Educational"];

export function BlogIdeasTab() {
  const headingId = useId();

  const [topic,       setTopic]       = useState("");
  const [description, setDescription] = useState("");
  const [tone,        setTone]        = useState("Casual");
  const [audience,    setAudience]    = useState("");
  const [numIdeas,    setNumIdeas]    = useState(5);
  const [keywords,    setKeywords]    = useState("");

  const [output,   setOutput]   = useState("");
  const [status,   setStatus]   = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied,   setCopied]   = useState(false);

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
      const res = await fetch("/api/admin/ai/blog-ideas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ topic, description, tone, audience, numIdeas, keywords }),
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
        <h2 id={headingId} className="text-base font-semibold text-gray-800">Blog Details</h2>

        {/* Topic + Tone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="blog-topic" className="block text-sm font-medium text-gray-700">
              Blog Topic <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="blog-topic"
              name="topic"
              type="text"
              required
              aria-required="true"
              aria-describedby="blog-topic-help"
              placeholder="e.g. Writing routines for busy authors"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
            <p id="blog-topic-help" className="text-xs text-gray-400">
              The core subject you want blog ideas generated around.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="blog-tone" className="block text-sm font-medium text-gray-700">Tone</label>
            <select
              id="blog-tone"
              name="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Guides the AI's writing voice.</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="blog-description" className="block text-sm font-medium text-gray-700">
            Additional Context <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            id="blog-description"
            name="description"
            rows={3}
            aria-describedby="blog-description-help"
            placeholder="e.g. Focus on authors who also have day jobs, avoid generic productivity tips"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
          />
          <p id="blog-description-help" className="text-xs text-gray-400">
            Add nuance, constraints, or direction for the AI.
          </p>
        </div>

        {/* Audience + Number of Ideas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="blog-audience" className="block text-sm font-medium text-gray-700">
              Target Audience <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              id="blog-audience"
              name="audience"
              type="text"
              placeholder="e.g. Aspiring fiction writers"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isStreaming}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="blog-num-ideas" className="block text-sm font-medium text-gray-700">
              How many ideas?
            </label>
            <input
              id="blog-num-ideas"
              name="numIdeas"
              type="number"
              min={1}
              max={20}
              value={numIdeas}
              onChange={(e) => setNumIdeas(Number(e.target.value))}
              disabled={isStreaming}
              className={inputClass}
            />
            <p className="text-xs text-gray-400">Between 1 and 20.</p>
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-1">
          <label htmlFor="blog-keywords" className="block text-sm font-medium text-gray-700">
            Keywords <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="blog-keywords"
            name="keywords"
            type="text"
            placeholder="e.g. self-publishing, author platform, book marketing"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isStreaming}
            className={inputClass}
          />
          <p className="text-xs text-gray-400">
            Comma-separated keywords for the AI to incorporate.
          </p>
        </div>

        {/* Error */}
        {status === "error" && (
          <div role="alert" aria-live="polite" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isStreaming || !topic.trim()}
            aria-label="Generate blog ideas based on the entered information"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              : <><Sparkles className="h-4 w-4" /> Generate Ideas</>}
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
            <label htmlFor="blog-output" className="block text-sm font-medium text-gray-700">
              Generated Ideas
              {isStreaming && <span aria-live="polite" className="ml-2 text-xs text-blue-500 font-normal">Writing…</span>}
            </label>
            {status === "done" && output && (
              <button type="button" onClick={handleCopy}
                aria-label="Copy generated ideas to clipboard"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1">
                {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            )}
          </div>
          <textarea
            id="blog-output"
            readOnly
            rows={14}
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
