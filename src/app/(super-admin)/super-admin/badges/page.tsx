import { prisma } from "@/lib/db";
import { BadgesClient } from "@/components/super-admin/badges-client";

export default async function SuperAdminBadgesPage() {
  const badges = await prisma.badgeDefinition.findMany({
    orderBy: [{ metric: "asc" }, { threshold: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievement Badges</h1>
        <p className="text-sm text-gray-500 mt-1">
          Auto-calculated from author activity (books, sales, reviews, etc.) — no manual
          application. Toggle a badge off to hide it platform-wide, or adjust its threshold.
          Authors get only their highest earned tier per metric.
        </p>
      </div>
      <BadgesClient initialBadges={badges as any} />
    </div>
  );
}
