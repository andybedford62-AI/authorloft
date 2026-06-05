import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { FeedbackModeration } from "@/components/admin/feedback-moderation";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const authorId = await getAdminAuthorId();

  const feedback = await prisma.bookFeedback.findMany({
    where: { book: { authorId } },
    include: {
      book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = feedback.filter((f) => f.status === "PENDING").length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reader Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ratings and comments submitted by readers across your books
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      <FeedbackModeration
        initialFeedback={feedback.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
