import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HelpCentreAdmin } from "@/components/super-admin/help-centre-admin";

export default async function SuperAdminHelpPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const [topics, articles, tooltips] = await Promise.all([
    prisma.helpTopic.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subtopics: { orderBy: { sortOrder: "asc" } },
        _count: { select: { articles: true } },
      },
    }),
    prisma.helpArticle.findMany({
      orderBy: [{ topicId: "asc" }, { sortOrder: "asc" }],
      include: {
        topic:    { select: { id: true, title: true } },
        subtopic: { select: { id: true, title: true } },
      },
    }),
    prisma.helpTooltip.findMany({ orderBy: { tooltipKey: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Centre</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage help articles, topics, and tooltips. Changes are live immediately.
          </p>
        </div>
      </div>
      <HelpCentreAdmin initialTopics={topics as any} initialArticles={articles as any} initialTooltips={tooltips} />
    </div>
  );
}
