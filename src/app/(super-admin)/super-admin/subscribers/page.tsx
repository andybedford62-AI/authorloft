import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubscribersClient } from "@/components/super-admin/subscribers-client";

export const metadata = {
  title: "News Subscribers — AuthorLoft Admin",
  description: "AuthorLoft News email subscriber list",
};

export default async function SuperAdminSubscribersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const rows = await prisma.platformSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, source: true, isConfirmed: true, createdAt: true },
  });

  const subscribers = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">News Subscribers</h1>
        <p className="text-sm text-gray-500 mt-1">
          People who signed up for AuthorLoft News on the public site. Email sending is not enabled yet —
          this is the audience list you&apos;re building now.
        </p>
      </div>

      <SubscribersClient subscribers={subscribers} />
    </div>
  );
}
