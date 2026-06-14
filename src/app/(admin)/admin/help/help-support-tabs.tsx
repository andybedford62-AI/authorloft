"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { HelpCircle, Headphones } from "lucide-react";
import { HelpArticles } from "./help-articles";

type TabId = "help" | "contact";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "help",    label: "Help centre",    icon: HelpCircle },
  { id: "contact", label: "Contact support", icon: Headphones },
];

export function HelpSupportTabs({ contact }: { contact: ReactNode }) {
  const searchParams = useSearchParams();
  const initial: TabId = searchParams.get("tab") === "contact" ? "contact" : "help";
  const [tab, setTab] = useState<TabId>(initial);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help &amp; Support</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find answers to common questions, or get in touch with the AuthorLoft team.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "help" ? <HelpArticles /> : contact}
    </div>
  );
}
