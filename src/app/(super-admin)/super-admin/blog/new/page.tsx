import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PlatformPostForm } from "@/components/super-admin/platform-post-form";
import { getCategoryNames } from "@/lib/categories";

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const [blogCategories, newsCategories] = await Promise.all([
    getCategoryNames("blog"),
    getCategoryNames("news"),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-sm text-gray-500 mt-1">Create a blog article or a News post for AuthorLoft.</p>
      </div>
      <PlatformPostForm
        blogCategories={[...blogCategories].sort((a, b) => a.localeCompare(b))}
        newsCategories={[...newsCategories].sort((a, b) => a.localeCompare(b))}
      />
    </div>
  );
}
