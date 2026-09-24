"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2 } from "lucide-react";

// Copy link / View live icons for a published item's row on the Books, Courses
// and Music lists. Callers render it for published items only — a draft's URL
// would 404.

export function ShareRowActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        type="button"
        onClick={copyLink}
        title="Copy public link"
        aria-label={`Copy public link for ${title}`}
        className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="View live page"
        aria-label={`View ${title} live`}
        className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
