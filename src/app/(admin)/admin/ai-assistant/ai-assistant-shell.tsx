"use client";

import { useState } from "react";
import { BookOpen, Lightbulb, Megaphone, MessageSquareHeart, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookDescriptionsTab } from "./tabs/book-descriptions";
import { BlogIdeasTab }        from "./tabs/blog-ideas";
import { MarketingCopyTab }    from "./tabs/marketing-copy";
import { ReaderFeedbackTab }   from "./tabs/reader-feedback";

const TABS = [
  {
    id:          "descriptions",
    label:       "Book Descriptions",
    icon:        BookOpen,
    description: "Generate compelling book descriptions for retail listings and your author site.",
    ready:       true,
  },
  {
    id:          "blog",
    label:       "Blog Ideas",
    icon:        Lightbulb,
    description: "Generate blog post drafts, outlines, and ideas for your author site.",
    ready:       true,
  },
  {
    id:          "marketing",
    label:       "Marketing Copy",
    icon:        Megaphone,
    description: "Create back-cover blurbs, Amazon descriptions, social posts, and ad copy.",
    ready:       true,
  },
  {
    id:          "feedback",
    label:       "Reader Feedback",
    icon:        MessageSquareHeart,
    description: "Analyse reader reviews and craft thoughtful responses.",
    ready:       true,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ShellProps {
  hasOwnKey:  boolean;
  usageCount: number;
  usageCap:   number;
  atLimit:    boolean;
}

export function AiAssistantShell({ hasOwnKey, usageCount, usageCap, atLimit }: ShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("descriptions");

  return (
    <div className="space-y-3">

      {/* Usage banner */}
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
            <Link href="/admin/settings" className="font-semibold underline hover:text-amber-900">
              Add your own Gemini API key in Settings
            </Link>{" "}
            to continue with no limits.
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{usageCount} of {usageCap} free AI requests used this month</span>
            <Link href="/admin/settings" className="text-blue-600 hover:underline">Add your own key →</Link>
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
        <div className="flex border-b border-gray-200 overflow-x-auto" role="tablist" aria-label="AI Assistant tools">
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`tabpanel-${id}`}
              id={`tab-${id}`}
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
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "descriptions" && <BookDescriptionsTab />}
          {activeTab === "blog"         && <BlogIdeasTab />}
          {activeTab === "marketing"    && <MarketingCopyTab />}
          {activeTab === "feedback"     && <ReaderFeedbackTab />}
        </div>
      </div>
    </div>
  );
}
