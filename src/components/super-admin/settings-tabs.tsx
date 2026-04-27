"use client";

import { useState } from "react";
import {
  Database,
  Users,
  BookOpen,
  Mail,
  ShoppingBag,
  Globe,
  WifiOff,
  Image,
  FlaskConical,
  Settings,
  UserX,
} from "lucide-react";
import { formatCents } from "@/lib/utils";
import { MaintenanceToggle } from "./maintenance-toggle";
import { MarketingHeroImage } from "./marketing-hero-image";
import { BetaModePanel } from "./beta-mode-panel";
import { GhostUsersPanel } from "./ghost-users-panel";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlanStat {
  id: string;
  name: string;
  monthlyPriceCents: number;
  _count: { authors: number };
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

export interface SettingsTabsProps {
  authorCount: number;
  bookCount: number;
  subscriberCount: number;
  orderCount: number;
  totalRevenueCents: number;
  planBreakdown: PlanStat[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
  betaMode: boolean;
  betaMessage: string;
  betaCodes: InviteCodeRow[];
  marketingHeroImageUrl: string | null;
  /** Env var display values — secrets resolved server-side before passing to client */
  envValues: { label: string; value: string | undefined }[];
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",      label: "Overview",      icon: Database    },
  { id: "onboarding",    label: "Onboarding",    icon: UserX       },
  { id: "beta",          label: "Beta Mode",      icon: FlaskConical },
  { id: "maintenance",   label: "Maintenance",    icon: WifiOff     },
  { id: "marketing",     label: "Marketing",      icon: Image       },
  { id: "configuration", label: "Configuration",  icon: Globe       },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Main component ─────────────────────────────────────────────────────────────

export function SettingsTabs(props: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === "overview"      && <OverviewTab      {...props} />}
      {activeTab === "onboarding"    && <OnboardingTab />}
      {activeTab === "beta"          && <BetaTab          {...props} />}
      {activeTab === "maintenance"   && <MaintenanceTab   {...props} />}
      {activeTab === "marketing"     && <MarketingTab     {...props} />}
      {activeTab === "configuration" && <ConfigurationTab {...props} />}
    </div>
  );
}

// ── Overview tab ───────────────────────────────────────────────────────────────

function OverviewTab({ authorCount, bookCount, subscriberCount, orderCount, totalRevenueCents, planBreakdown }: SettingsTabsProps) {
  const stats = [
    { label: "Total Authors",     value: authorCount,     icon: Users,       color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Books",       value: bookCount,       icon: BookOpen,    color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Total Subscribers", value: subscriberCount, icon: Mail,        color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Completed Orders",  value: orderCount,      icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-50"  },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-400" />
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Total Platform Revenue</span>
          <span className="text-lg font-bold text-green-600">
            {formatCents(totalRevenueCents)}
          </span>
        </div>
      </section>

      {/* Plan distribution */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          Author Distribution by Plan
        </h2>
        <div className="space-y-3">
          {planBreakdown.map((plan) => {
            const pct = authorCount > 0 ? Math.round((plan._count.authors / authorCount) * 100) : 0;
            return (
              <div key={plan.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{plan.name}</span>
                  <span className="text-gray-500">
                    {plan._count.authors} author{plan._count.authors !== 1 ? "s" : ""} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Onboarding tab ────────────────────────────────────────────────────────────

function OnboardingTab() {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserX className="h-4 w-4 text-gray-400" />
          Ghost Account Management
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Verified accounts that have never added a book. Reminder sent at day 7, auto-deleted at day 14.
        </p>
      </div>
      <GhostUsersPanel />
    </section>
  );
}

// ── Beta tab ───────────────────────────────────────────────────────────────────

function BetaTab({ betaMode, betaMessage, betaCodes }: SettingsTabsProps) {
  return (
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
  );
}

// ── Maintenance tab ────────────────────────────────────────────────────────────

function MaintenanceTab({ maintenanceMode, maintenanceMessage }: SettingsTabsProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-gray-400" />
        Maintenance Mode
      </h2>
      <p className="text-xs text-gray-500">
        When enabled, all logins and new registrations are blocked and visitors are redirected to the maintenance page.
        The marketing site, demos, and email contact remain accessible.
      </p>
      <MaintenanceToggle
        initialMode={maintenanceMode}
        initialMessage={maintenanceMessage}
      />
    </section>
  );
}

// ── Marketing tab ──────────────────────────────────────────────────────────────

function MarketingTab({ marketingHeroImageUrl }: SettingsTabsProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Image className="h-4 w-4 text-gray-400" />
          Marketing Hero Image
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          The screenshot shown on the right side of the homepage hero section.
        </p>
      </div>
      <MarketingHeroImage initialUrl={marketingHeroImageUrl} />
    </section>
  );
}

// ── Configuration tab ──────────────────────────────────────────────────────────

function ConfigurationTab({ envValues }: SettingsTabsProps) {
  return (
    <div className="space-y-6">
      {/* Env vars */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-400" />
          Platform Configuration
        </h2>
        <div className="space-y-3 text-sm">
          {envValues.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className={`font-mono text-xs ${value ? "text-gray-700 bg-gray-100 px-2 py-0.5 rounded" : "text-amber-600"}`}>
                {value ?? "Not configured"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Admin tools */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400" />
          Admin Tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Analytics Dashboard",  href: "https://us.posthog.com/shared/PJJkxbjMkF2F5sJe-XCSQ6Cx0gYM6g", desc: "Page views, signups & conversions" },
            { label: "Supabase Dashboard", href: "https://supabase.com/dashboard", desc: "Manage the database directly"    },
            { label: "Stripe Dashboard",   href: "https://dashboard.stripe.com",   desc: "View payments and subscriptions" },
            { label: "Docs: Next.js",      href: "https://nextjs.org/docs",        desc: "Next.js 15 documentation"        },
            { label: "Docs: Prisma",       href: "https://www.prisma.io/docs",     desc: "Prisma ORM documentation"        },
          ].map(({ label, href, desc }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <Globe className="h-4 w-4 text-gray-300 group-hover:text-purple-400 flex-shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
