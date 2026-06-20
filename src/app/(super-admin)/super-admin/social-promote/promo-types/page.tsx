import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPromotePromoTypesPanel } from "@/components/super-admin/social-promote-promo-types-panel";

export default async function SocialPromotePromoTypesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const [promoTypes, platforms] = await Promise.all([
    prisma.socialPromoType.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.socialPromotePlatform.findMany({
      select: { slug: true, name: true },
      orderBy: [{ sortOrder: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Promote — Promo Types</h1>
        <p className="text-sm text-gray-500 mt-1">
          Promo types are the templates authors pick from (e.g. "New Release", "Sale", "Behind-the-Scenes"). Each
          one carries its own prompt template, context restrictions, and platform restrictions. Empty restriction
          lists mean "applies to all".
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SocialPromotePromoTypesPanel initialPromoTypes={promoTypes} platforms={platforms} />
      </div>
    </div>
  );
}
