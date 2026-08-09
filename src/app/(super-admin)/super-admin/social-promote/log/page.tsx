import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPromoteLogPanel } from "@/components/super-admin/social-promote-log-panel";

const PAGE_SIZE = 50;

export default async function SocialPromoteLogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const [rows, total, platforms, promoTypes, stats] = await Promise.all([
    prisma.generatedSocialPost.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: {
        author:    { select: { id: true, name: true, displayName: true, email: true, slug: true } },
        platform:  { select: { id: true, slug: true, name: true } },
        promoType: { select: { id: true, slug: true, name: true } },
      },
    }),
    prisma.generatedSocialPost.count(),
    prisma.socialPromotePlatform.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: [{ sortOrder: "asc" }],
    }),
    prisma.socialPromoType.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: [{ sortOrder: "asc" }],
    }),
    prisma.generatedSocialPost.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum:   { costMicroCents: true },
    }),
  ]);

  const totalCostMicroCents = stats.reduce((acc, s) => acc + (s._sum.costMicroCents ?? 0), 0);
  const successCount        = stats.find((s) => s.status === "SUCCESS")?._count._all ?? 0;
  const failedCount         = stats.find((s) => s.status === "FAILED")?._count._all ?? 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Promote — Generation Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every AI generation is logged here for analytics, abuse detection, and debugging. Use the filters below
          to drill into a specific author, platform, or promo type. Authors only ever see their own outputs.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total generations" value={total.toLocaleString()} />
        <StatCard label="Successful" value={successCount.toLocaleString()} />
        <StatCard label="Failed" value={failedCount.toLocaleString()} variant={failedCount > 0 ? "warn" : "default"} />
        <StatCard label="Total cost" value={`$${(totalCostMicroCents / 1_000_000 * 100 / 100).toFixed(4)}`} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SocialPromoteLogPanel
          initialRows={rows as any}
          initialTotal={total}
          pageSize={PAGE_SIZE}
          platforms={platforms}
          promoTypes={promoTypes}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, variant = "default" }: { label: string; value: string; variant?: "default" | "warn" }) {
  const valueColor = variant === "warn" ? "text-amber-700" : "text-gray-900";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
