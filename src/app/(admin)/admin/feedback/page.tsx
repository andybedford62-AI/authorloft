import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { FeedbackModeration } from "@/components/admin/feedback-moderation";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const authorId = await getAdminAuthorId();

  const [bookFeedback, courseFeedback] = await Promise.all([
    prisma.bookFeedback.findMany({
      where: { book: { authorId } },
      include: { book: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.courseFeedback.findMany({
      where: { course: { authorId } },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const feedback = [
    ...bookFeedback.map((f) => ({
      id: f.id,
      itemType: "book" as const,
      itemId: f.book.id,
      itemTitle: f.book.title,
      reviewerName: f.reviewerName,
      reviewerEmail: f.reviewerEmail,
      rating: f.rating,
      comment: f.comment,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
    ...courseFeedback.map((f) => ({
      id: f.id,
      itemType: "course" as const,
      itemId: f.course.id,
      itemTitle: f.course.title,
      reviewerName: f.reviewerName,
      reviewerEmail: f.reviewerEmail,
      rating: f.rating,
      comment: f.comment,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingCount = feedback.filter((f) => f.status === "PENDING").length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reader Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ratings and comments submitted by readers across your books and courses
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      <FeedbackModeration initialFeedback={feedback} />
    </div>
  );
}
