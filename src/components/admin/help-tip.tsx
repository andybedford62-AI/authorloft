"use client";

import { useState, useEffect, useRef } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface TooltipData {
  tooltipKey:   string;
  title:        string;
  content:      string;
  learnMoreUrl: string | null;
}

// Module-level cache — shared across all HelpTip instances, fetched once per session
let cache: TooltipData[] | null = null;
let pending: Promise<TooltipData[]> | null = null;

function loadTooltips(): Promise<TooltipData[]> {
  if (cache) return Promise.resolve(cache);
  if (pending) return pending;
  pending = fetch("/api/admin/help")
    .then((r) => r.json())
    .then((data) => {
      cache = data.tooltips ?? [];
      pending = null;
      return cache!;
    })
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}

interface HelpTipProps {
  id:        string;
  className?: string;
}

export function HelpTip({ id, className = "" }: HelpTipProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [open,    setOpen]    = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTooltips().then((all) => {
      const found = all.find((t) => t.tooltipKey === id);
      if (found) setTooltip(found);
    });
  }, [id]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!tooltip) return null;

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
        aria-label={`Help: ${tooltip.title}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute left-5 top-0 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-900">{tooltip.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{tooltip.content}</p>
          {tooltip.learnMoreUrl && (
            <Link
              href={tooltip.learnMoreUrl}
              className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline font-medium"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-3 w-3" />
              Learn more in Help Centre
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
