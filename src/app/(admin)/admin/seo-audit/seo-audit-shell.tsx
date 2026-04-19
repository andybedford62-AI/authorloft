"use client";

import { useState } from "react";
import { Tag, BarChart2, Link2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MetaTagsTab }        from "./tabs/meta-tags";
import { KeywordDensityTab }  from "./tabs/keyword-density";
import { InternalLinksTab }   from "./tabs/internal-links";

type Book = { id: string; title: string; slug: string; description: string | null };

const TABS = [
  { id: "meta",     label: "Meta Tags",        icon: Tag      },
  { id: "keywords", label: "Keyword Density",  icon: BarChart2 },
  { id: "links",    label: "Internal Links",   icon: Link2    },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ShellProps {
  books:      Book[];
  hasOwnKey:  boolean;
  usageCount: number;
  usageCap:   number;
  atLimit:    boolean;
}

export function SeoAuditShell({ books, hasOwnKey, usageCount, usageCap, atLimit }: ShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("meta");

  return (
    <div className="space-y-3">

      {/* Usage banner — identical pattern to AI Assistant */}
      {hasOwnKey ? (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
          Using your Gemini API key — no monthly limits apply.
        </div>
      ) : atLimit ? (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>
            You've used all {usageCap} free AI requests this month.{" "}
            <Link href="/admin/settings" className="font-semibold underline hover:text-amber-900 cursor-pointer">
              Add your own Gemini API key in Settings
            </Link>{" "}
            to continue with no limits.
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{usageCount} of {usageCap} free AI requests used this month</span>
            <Link href="/admin/settings" className="text-blue-600 hover:underline cursor-pointer">Add your own key →</Link>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                usageCount / usageCap >= 0.8 ? "bg-amber-500" : "bg-blue-500"
              )}
              style={{ width: `${Math.min(100, (usageCount / usageCap) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto" role="tablist" aria-label="SEO Audit tools">
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`seo-tabpanel-${id}`}
              id={`seo-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                activeTab === id
                  ? "border-blue-600 text-blue-700 bg-blue-50/60"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              <TabIcon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div
          id={`seo-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`seo-tab-${activeTab}`}
        >
          {activeTab === "meta"     && <MetaTagsTab books={books} />}
          {activeTab === "keywords" && <KeywordDensityTab books={books} />}
          {activeTab === "links"    && <InternalLinksTab books={books} />}
        </div>
      </div>
    </div>
  );
}
