"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

export function SitemapUrlPill({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-600 hover:text-blue-700"
      >
        {url}
        <ExternalLink className="h-3 w-3 text-gray-400" />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy sitemap URL"
        title={copied ? "Copied!" : "Copy URL"}
        className="ml-1 p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
