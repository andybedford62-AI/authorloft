import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessagesClient } from "./messages-client";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const messages = await prisma.contactMessage.findMany({
    where: { authorId, isArchived: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      senderName: true,
      senderEmail: true,
      website: true,
      subject: true,
      message: true,
      isRead: true,
      isArchived: true,
      createdAt: true,
    },
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contact messages from your readers
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
      </div>

      <MessagesClient initialMessages={messages} />
    </div>
  );
}
