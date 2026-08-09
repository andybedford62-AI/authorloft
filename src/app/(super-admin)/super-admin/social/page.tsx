import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialTabs } from "@/components/super-admin/social-tabs";

export const metadata = {
  title: "Social Media - AuthorLoft Admin",
  description: "Post content and manage social media links",
};

export default async function SuperAdminSocialPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const [tokens, posts] = await Promise.all([
    prisma.socialPlatformToken.findMany({
      orderBy: { platform: "asc" },
      select: { id: true, platform: true, accountId: true, accountName: true, tokenExpiresAt: true, isActive: true, updatedAt: true },
    }),
    prisma.socialPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { results: { select: { platform: true, status: true, platformPostId: true, error: true, publishedAt: true } } },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
        <p className="text-sm text-gray-500 mt-1">
          Post marketing content to social platforms and manage AuthorLoft&apos;s company social links.
        </p>
      </div>

      <SocialTabs tokens={tokens as any} posts={posts as any} />
    </div>
  );
}
