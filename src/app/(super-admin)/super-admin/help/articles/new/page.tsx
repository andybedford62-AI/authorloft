import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HelpArticleForm } from "@/components/super-admin/help-article-form";

export default async function NewHelpArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const topics = await prisma.helpTopic.findMany({
    orderBy: { sortOrder: "asc" },
    include: { subtopics: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Help Article</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new question and answer for the Help Centre.</p>
      </div>
      <HelpArticleForm topics={topics} />
    </div>
  );
}
