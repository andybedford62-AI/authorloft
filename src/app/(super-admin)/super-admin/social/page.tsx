import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Link2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPlatformConnect } from "@/components/super-admin/social-platform-connect";
import { SocialPostsClient } from "@/components/super-admin/social-posts-client";
import { SocialLinksPanel } from "@/components/super-admin/social-links-panel";

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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Social Media Management</h1>
        <p className="text-gray-600 mt-1">Post content to platforms and manage company social links</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg flex gap-0">
        <a
          href="#posting"
          className="flex items-center gap-2 px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm hover:text-blue-700"
        >
          <MessageSquare className="h-4 w-4" />
          Post Content
        </a>
        <a
          href="#links"
          className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-gray-600 font-medium text-sm hover:text-gray-900"
        >
          <Link2 className="h-4 w-4" />
          Company Links
        </a>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Post Content Tab */}
        <section id="posting" className="space-y-6">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Post Content</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Post AuthorLoft marketing content to LinkedIn, Facebook, and Instagram.
                </p>
              </div>
              <Link
                href="/super-admin/social/new"
                className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Post
              </Link>
            </div>
          </div>

          <SocialPlatformConnect initialTokens={tokens as any} />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Posts</h3>
            <SocialPostsClient initialPosts={posts as any} />
          </div>
        </section>

        {/* Company Links Tab */}
        <section id="links" className="space-y-6 pt-8 border-t border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Company Social Links</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage AuthorLoft's official social media links displayed on marketing pages and footer.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SocialLinksPanel />
          </div>
        </section>
      </div>
    </div>
  );
}
