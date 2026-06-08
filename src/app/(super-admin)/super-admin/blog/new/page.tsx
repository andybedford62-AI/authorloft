import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PlatformPostForm } from "@/components/super-admin/platform-post-form";

async function getDistinctCategories(): Promise<string[]> {
  const rows = await prisma.platformPost.findMany({
    where: { category: { not: "" } },
    select: { category: true },
    distinct: ["category"],
  }).catch(() => []);
  return rows.map((r) => r.category).filter(Boolean);
}

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const categorySuggestions = await getDistinctCategories();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-sm text-gray-500 mt-1">Create a blog article or a News post for AuthorLoft.</p>
      </div>
      <PlatformPostForm categorySuggestions={categorySuggestions} />
    </div>
  );
}
