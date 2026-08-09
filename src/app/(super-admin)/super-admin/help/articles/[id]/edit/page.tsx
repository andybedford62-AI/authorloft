import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HelpArticleForm } from "@/components/super-admin/help-article-form";

export default async function EditHelpArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const { id } = await params;

  const [article, topics] = await Promise.all([
    prisma.helpArticle.findUnique({ where: { id } }),
    prisma.helpTopic.findMany({
      orderBy: { sortOrder: "asc" },
      include: { subtopics: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Help Article</h1>
        <p className="text-sm text-gray-500 mt-1">Update the question and answer for this Help Centre entry.</p>
      </div>
      <HelpArticleForm topics={topics} article={article} />
    </div>
  );
}
