"use client";

import { useState } from "react";
import { Inbox, FlaskConical } from "lucide-react";
import { AccessRequestsTable } from "./AccessRequestsTable";
import { BetaModePanel } from "@/components/super-admin/beta-mode-panel";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  usageType: string;
  isRead: boolean;
  createdAt: string;
}

interface InviteCodeRow {
  id: string;
  code: string;
  label: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface Props {
  requests: AccessRequest[];
  betaMode: boolean;
  betaMessage: string;
  betaCodes: InviteCodeRow[];
}

type TabId = "requests" | "beta";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "requests", label: "Access Requests", icon: Inbox },
  { id: "beta",     label: "Beta Mode",        icon: FlaskConical },
];

export function AccessRequestsClient({ requests, betaMode, betaMessage, betaCodes }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("requests");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-700 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "requests" && (
        <AccessRequestsTable initial={requests} />
      )}

      {activeTab === "beta" && (
        <section className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-100 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-400" />
              Beta Mode
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              When enabled, new registrations require an invite code and Google sign-up is blocked for new accounts.
              Toggle off to go live — no code changes required.
            </p>
          </div>
          <BetaModePanel
            initialBetaMode={betaMode}
            initialBetaMessage={betaMessage}
            initialCodes={betaCodes}
          />
        </section>
      )}
    </div>
  );
}
