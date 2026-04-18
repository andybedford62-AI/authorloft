"use client";

import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";

interface Props {
  output: string;
  status: "idle" | "streaming" | "done" | "error";
}

export function ResultBox({ output, status }: Props) {
  const [copied, setCopied] = useState(false);

  // Show spinner only while waiting for first tokens
  if (status === "streaming" && !output) {
    return (
      <div className="flex items-center justify-center py-16 border border-dashed border-gray-200 rounded-xl mt-4">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-400">Generating…</span>
      </div>
    );
  }

  if (!output) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy result to clipboard"
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs
          text-gray-400 hover:text-gray-700 transition-colors
          focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1.5 py-1"
      >
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
          : <><Copy className="w-3.5 h-3.5" /> Copy</>}
      </button>
      <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed pr-16 font-sans">
        {output}
      </pre>
    </div>
  );
}
