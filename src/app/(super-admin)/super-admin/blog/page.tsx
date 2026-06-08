import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BlogPostsClient } from "@/components/super-admin/blog-posts-client";

export default async function SuperAdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const posts = await prisma.platformPost.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, slug: true, category: true, isNews: true, isPublished: true,
      publishedAt: true, displayOrder: true, readTimeMinutes: true, createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog &amp; News</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage posts for authorloft.com/blog and /news. Use the Post Type toggle in the editor to
            choose where each post appears. Search and sort columns to find what you need.
          </p>
        </div>
        <a
          href="/super-admin/blog/new"
          className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          + New Post
        </a>
      </div>
      <BlogPostsClient initialPosts={posts as any} />
    </div>
  );
}
