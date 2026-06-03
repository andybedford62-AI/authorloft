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
  Settings,
  UserX,
  Star,
  Zap,
  MessageSquare,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { formatCents } from "@/lib/utils";
import { MaintenanceToggle } from "./maintenance-toggle";
import { SignupNotificationsToggle } from "./signup-notifications-toggle";
import { AiCapControl } from "./ai-cap-control";
import { MarketingHeroImage } from "./marketing-hero-image";
import { GhostUsersPanel } from "./ghost-users-panel";
import { SupportEmailsPanel } from "./support-emails-panel";
import { TestimonialsPanel } from "./testimonials-panel";
import { FaqsPanel } from "./faqs-panel";
import { WelcomeEmailPanel } from "./welcome-email-panel";
import { MassEmailPanel } from "./mass-email-panel";
import { SeoPanel } from "./seo-panel";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlanStat {
  id: string;
  name: string;
  monthlyPriceCents: number;
  _count: { authors: number };
}

interface SupportEmailRow {
  id: string;
  label: string;
  email: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface TestimonialRow {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
  image: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
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
  newSignupNotifications:  boolean;
  signupNotificationEmail: string;
  defaultAiUsageCap: number;
  marketingHeroImageUrl: string | null;
  supportEmails: SupportEmailRow[];
  testimonials: TestimonialRow[];
  faqs: FaqRow[];
  welcomeEmailSubject: string | null;
  welcomeEmailBody:    string | null;
  envValues: { label: string; value: string | undefined }[];
}

// ── Nav structure ──────────────────────────────────────────────────────────────

type SectionId =
  | "overview"
  | "emails"
  | "welcome-email"
  | "mass-email"
  | "marketing"
  | "testimonials"
  | "faqs"
  | "seo"
  | "maintenance"
  | "onboarding"
  | "configuration";

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { id: "overview",      label: "Overview",        icon: Database      },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "welcome-email", label: "Welcome Email",   icon: Zap           },
      { id: "mass-email",    label: "Mass Email",      icon: MessageSquare },
      { id: "emails",        label: "Email Addresses", icon: Mail          },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "marketing",     label: "Marketing",       icon: Image         },
      { id: "testimonials",  label: "Testimonials",    icon: Star          },
      { id: "faqs",          label: "FAQs",            icon: HelpCircle    },
      { id: "seo",           label: "Social Images",   icon: Globe         },
    ],
  },
  {
    label: "System",
    items: [
      { id: "maintenance",   label: "Maintenance",     icon: WifiOff       },
      { id: "onboarding",    label: "Onboarding",      icon: UserX         },
      { id: "configuration", label: "Configuration",   icon: Globe         },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────────

export function SettingsTabs(props: SettingsTabsProps) {
  const [active, setActive] = useState<SectionId>("overview");

  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === active);

  return (
    <div className="flex gap-6 min-h-[600px]">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0">
        <nav className="space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => setActive(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        active === id
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${active === id ? "text-purple-500" : "text-gray-400"}`} />
                      {label}
                      {active === id && <ChevronRight className="h-3 w-3 ml-auto text-purple-400" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Content area ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {active === "overview"      && <OverviewTab      {...props} />}
        {active === "onboarding"    && <OnboardingTab />}
        {active === "maintenance"   && <MaintenanceTab   {...props} />}
        {active === "marketing"     && <MarketingTab     {...props} />}
        {active === "testimonials"  && <TestimonialsPanel initialTestimonials={props.testimonials} />}
        {active === "faqs"          && <FaqsPanel initialFaqs={props.faqs} />}
        {active === "emails"        && <SupportEmailsPanel initialEmails={props.supportEmails} />}
        {active === "welcome-email" && <WelcomeEmailPanel initialSubject={props.welcomeEmailSubject} initialBody={props.welcomeEmailBody} />}
        {active === "mass-email"    && <MassEmailPanel />}
        {active === "seo"           && <SeoTab />}
        {active === "configuration" && <ConfigurationTab {...props} />}
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function OverviewTab({ authorCount, bookCount, subscriberCount, orderCount, totalRevenueCents, planBreakdown }: SettingsTabsProps) {
  const stats = [
    { label: "Total Authors",     value: authorCount,     icon: Users,       color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Books",       value: bookCount,       icon: BookOpen,    color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Total Subscribers", value: subscriberCount, icon: Mail,        color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Completed Orders",  value: orderCount,      icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-50"  },
  ];

  return (
    <div className="space-y-6">
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
          <span className="text-lg font-bold text-green-600">{formatCents(totalRevenueCents)}</span>
        </div>
      </section>

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
                  <div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

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

// ── Maintenance ────────────────────────────────────────────────────────────────

function MaintenanceTab({ maintenanceMode, maintenanceMessage, newSignupNotifications, signupNotificationEmail, defaultAiUsageCap }: SettingsTabsProps) {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-gray-400" />
          Maintenance Mode
        </h2>
        <p className="text-xs text-gray-500">
          When enabled, all logins and new registrations are blocked and visitors are redirected to the maintenance page.
        </p>
        <MaintenanceToggle initialMode={maintenanceMode} initialMessage={maintenanceMessage} />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          New Signup Notifications
        </h2>
        <p className="text-xs text-gray-500">
          Receive an email notification each time a new author creates an account.
        </p>
        <SignupNotificationsToggle initialEnabled={newSignupNotifications} initialEmail={signupNotificationEmail} />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="h-4 w-4 text-gray-400" />
          AI Usage Baseline
        </h2>
        <p className="text-xs text-gray-500">
          Default monthly AI call limit for all authors on Premium.
        </p>
        <AiCapControl initialCap={defaultAiUsageCap} />
      </section>
    </div>
  );
}

// ── Marketing ──────────────────────────────────────────────────────────────────

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

// ── SEO / Social Images ────────────────────────────────────────────────────────

function SeoTab() {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <SeoPanel />
    </section>
  );
}

// ── Configuration ──────────────────────────────────────────────────────────────

function ConfigurationTab({ envValues }: SettingsTabsProps) {
  return (
    <div className="space-y-6">
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

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400" />
          Admin Tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
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
