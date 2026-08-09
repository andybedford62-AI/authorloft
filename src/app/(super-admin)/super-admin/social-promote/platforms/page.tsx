import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPromotePlatformsPanel } from "@/components/super-admin/social-promote-platforms-panel";

export default async function SocialPromotePlatformsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const platforms = await prisma.socialPromotePlatform.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Promote — Platforms</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure which social platforms authors can generate posts for. Character limits, hashtag style, and
          per-platform prompt addenda are all applied at generation time. Premium-only platforms are hidden from
          Standard-plan authors.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SocialPromotePlatformsPanel initialPlatforms={platforms} />
      </div>
    </div>
  );
}
