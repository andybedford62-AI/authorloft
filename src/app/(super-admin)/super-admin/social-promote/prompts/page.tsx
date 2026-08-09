import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPromotePromptsPanel } from "@/components/super-admin/social-promote-prompts-panel";

export default async function SocialPromotePromptsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");
  const adminId = (session.user as any).id as string;

  const [promoTypes, platforms, books] = await Promise.all([
    prisma.socialPromoType.findMany({ orderBy: [{ sortOrder: "asc" }] }),
    prisma.socialPromotePlatform.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    }),
    prisma.book.findMany({
      where: { authorId: adminId, isPublished: true },
      select: { id: true, title: true, subtitle: true },
      orderBy: { title: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Promote — Prompts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit any promo type's prompt template and test-fire it live against the AI before saving. The test runs
          against your own super-admin account, so it's billed to the platform but not counted toward any author's
          plan limits. The platform's cost ceiling still applies.
        </p>
      </div>

      <SocialPromotePromptsPanel promoTypes={promoTypes} platforms={platforms} books={books} />
    </div>
  );
}
