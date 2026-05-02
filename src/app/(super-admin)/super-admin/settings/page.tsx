import { prisma } from "@/lib/db";
import { SettingsTabs } from "@/components/super-admin/settings-tabs";

export default async function SuperAdminSettingsPage() {
  const [
    authorCount,
    bookCount,
    subscriberCount,
    orderCount,
    revenueResult,
    planBreakdown,
    systemConfig,
    platformSettings,
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
      where:  { id: "main" },
      create: { id: "main", maintenanceMode: false, maintenanceMessage: "" },
      update: {},
    }),
    prisma.platformSettings.upsert({
      where:  { id: "singleton" },
      create: { id: "singleton" },
      update: {},
      select: { marketingHeroImageUrl: true },
    }),
  ]);

  // Build env display values server-side so secrets never reach the client bundle
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const envValues = [
    { label: "Platform Domain", value: process.env.NEXT_PUBLIC_PLATFORM_DOMAIN },
    { label: "App URL",         value: process.env.NEXT_PUBLIC_APP_URL          },
    { label: "Stripe Mode",     value: stripeKey ? (stripeKey.startsWith("sk_live") ? "Live key configured" : "Test key configured") : undefined },
    { label: "S3 Bucket",       value: process.env.AWS_S3_BUCKET                },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Overview and configuration of the AuthorLoft platform.</p>
      </div>

      <SettingsTabs
        authorCount={authorCount}
        bookCount={bookCount}
        subscriberCount={subscriberCount}
        orderCount={orderCount}
        totalRevenueCents={revenueResult._sum.totalCents ?? 0}
        planBreakdown={planBreakdown}
        maintenanceMode={systemConfig.maintenanceMode}
        maintenanceMessage={systemConfig.maintenanceMessage}
        marketingHeroImageUrl={platformSettings.marketingHeroImageUrl ?? null}
        envValues={envValues}
      />
    </div>
  );
}
