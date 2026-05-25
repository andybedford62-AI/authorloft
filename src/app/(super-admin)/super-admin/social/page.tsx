import { getServerSession }          from "next-auth";
import { redirect }                  from "next/navigation";
import Link                          from "next/link";
import { authOptions }               from "@/lib/auth";
import { prisma }                    from "@/lib/db";
import { SocialPlatformConnect }     from "@/components/super-admin/social-platform-connect";
import { SocialPostsClient }         from "@/components/super-admin/social-posts-client";

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
          <p className="text-sm text-gray-500 mt-1">
            Post AuthorLoft marketing content to LinkedIn, Facebook, and Instagram.
          </p>
        </div>
        <Link
          href="/super-admin/social/new"
          className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      <SocialPlatformConnect initialTokens={tokens as any} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Posts</h2>
        <SocialPostsClient initialPosts={posts as any} />
      </div>
    </div>
  );
}
