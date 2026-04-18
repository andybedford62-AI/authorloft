"use client";

import { useState } from "react";
import { BookOpen, Lightbulb, Megaphone, MessageSquareHeart, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookDescriptionsTab } from "./tabs/book-descriptions";

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
    ready:       false,
  },
  {
    id:          "marketing",
    label:       "Marketing Copy",
    icon:        Megaphone,
    description: "Create back-cover blurbs, Amazon descriptions, social posts, and ad copy.",
    ready:       false,
  },
  {
    id:          "feedback",
    label:       "Reader Feedback",
    icon:        MessageSquareHeart,
    description: "Analyse reader reviews and craft thoughtful responses.",
    ready:       false,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AiAssistantShell() {
  const [activeTab, setActiveTab] = useState<TabId>("descriptions");

  const tab = TABS.find((t) => t.id === activeTab)!;
  const Icon = tab.icon;

  return (
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

        {tab.ready === false && (
          <div className="p-8 min-h-[420px] flex flex-col items-center justify-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-semibold text-gray-900">{tab.label}</h2>
              <p className="text-sm text-gray-500">{tab.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              <Bot className="h-3.5 w-3.5" />
              Coming soon — this tab is being built
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
