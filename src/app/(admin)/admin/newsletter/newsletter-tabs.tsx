"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, PlugZap } from "lucide-react";
import { NewsletterIntegrationInner } from "./newsletter-integration-inner";

type TabId = "newsletter" | "integrations";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "newsletter",   label: "Newsletter",   icon: Mail    },
  { id: "integrations", label: "Integrations", icon: PlugZap },
];

export function NewsletterTabs({ newsletter }: { newsletter: ReactNode }) {
  const searchParams = useSearchParams();
  const initial: TabId = searchParams.get("tab") === "integrations" ? "integrations" : "newsletter";
  const [tab, setTab] = useState<TabId>(initial);

  return (
    <div className="space-y-6">
      {/* Top-level tab bar */}
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
      {tab === "newsletter" ? newsletter : <NewsletterIntegrationInner />}
    </div>
  );
}
