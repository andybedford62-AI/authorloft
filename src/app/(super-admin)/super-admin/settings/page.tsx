import { prisma } from "@/lib/db";
import { Settings, Globe, Database, BookOpen, Users, Mail, ShoppingBag, WifiOff } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { MaintenanceToggle } from "@/components/super-admin/maintenance-toggle";

export default async function SuperAdminSettingsPage() {
  // Gather platform-wide stats
  const [
    authorCount,
    bookCount,
    subscriberCount,
    orderCount,
    revenueResult,
    planBreakdown,
    maintenanceConfig,
  ] = await Promise.all([
    prisma.author.count(),
    prisma.book.count(),
    prisma.subscriber.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { totalCents: true } }),
    prisma.plan.findMany({
      include: { _count: { select: { authors: true } } },
      orderBy: { monthlyPriceCents: "asc" },
    }),
    prisma.systemConfig.upsert({
      where: { id: "main" },
      create: { id: "main", maintenanceMode: false, maintenanceMessage: "" },
      update: {},
    }),
  ]);

  const platformStats = [
    { label: "Total Authors",     value: authorCount,     icon: Users,       color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Books",       value: bookCount,       icon: BookOpen,    color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Total Subscribers", value: subscriberCount, icon: Mail,        color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Completed Orders",  value: orderCount,      icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-50"  },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Overview and configuration of the AuthorLoft platform.</p>
      </div>

      {/* Platform-wide stats */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-400" />
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map(({ label, value, icon: Icon, color, bg }) => (
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
            {formatCents(revenueResult._sum.totalCents ?? 0)}
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
                  <span className="text-gray-500">{plan._count.authors} author{plan._count.authors !== 1 ? "s" : ""} ({pct}%)</span>
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

      {/* Environment config */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-400" />
          Platform Configuration
        </h2>
        <div className="space-y-3 text-sm">
          {[
            { label: "Platform Domain",   key: "NEXT_PUBLIC_PLATFORM_DOMAIN",  fallback: "authorloft.com" },
            { label: "App URL",           key: "NEXT_PUBLIC_APP_URL",          fallback: "http://localhost:3000" },
            { label: "Stripe Mode",       key: "STRIPE_SECRET_KEY",            fallback: "Not configured", mask: true },
            { label: "S3 Bucket",         key: "AWS_S3_BUCKET",                fallback: "Not configured" },
          ].map(({ label, key, fallback, mask }) => {
            const val = process.env[key];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className={`font-mono text-xs ${val ? "text-gray-700 bg-gray-100 px-2 py-0.5 rounded" : "text-amber-600"}`}>
                  {val ? (mask ? "●●●●●●●●" : val) : fallback}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Maintenance Mode */}
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
          initialMode={maintenanceConfig.maintenanceMode}
          initialMessage={maintenanceConfig.maintenanceMessage}
        />
      </section>

      {/* Super Admin Tools */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400" />
          Admin Tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Supabase Dashboard",  href: "https://supabase.com/dashboard", desc: "Manage the database directly" },
            { label: "Stripe Dashboard",    href: "https://dashboard.stripe.com",   desc: "View payments and subscriptions" },
            { label: "Docs: Next.js",       href: "https://nextjs.org/docs",        desc: "Next.js 15 documentation" },
            { label: "Docs: Prisma",        href: "https://www.prisma.io/docs",     desc: "Prisma ORM documentation" },
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
