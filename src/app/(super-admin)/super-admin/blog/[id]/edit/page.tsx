import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PlatformPostForm } from "@/components/super-admin/platform-post-form";
import { getCategoryNames } from "@/lib/categories";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const { id } = await params;
  const [post, blogCategories, newsCategories] = await Promise.all([
    prisma.platformPost.findUnique({ where: { id } }),
    getCategoryNames("blog"),
    getCategoryNames("news"),
  ]);
  if (!post) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-500 mt-1 truncate max-w-lg">{post.title}</p>
      </div>
      <PlatformPostForm
        post={post as any}
        blogCategories={[...blogCategories].sort((a, b) => a.localeCompare(b))}
        newsCategories={[...newsCategories].sort((a, b) => a.localeCompare(b))}
      />
    </div>
  );
}
