"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 w-full justify-between bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-mono font-bold hover:bg-gray-700 transition-colors group"
      title="Copy discount code"
    >
      <span className="tracking-widest">{code}</span>
      <span className="flex items-center gap-1 text-xs font-sans font-normal text-gray-300 group-hover:text-white transition-colors">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span className="text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy code
          </>
        )}
      </span>
    </button>
  );
}
