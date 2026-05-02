import { prisma } from "@/lib/db";
import { Inbox } from "lucide-react";
import { AccessRequestsTable } from "./AccessRequestsTable";

export default async function AccessRequestsPage() {
  const requests = await prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = requests.length;
  const unread = requests.filter((r) => !r.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Inbox className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Access Requests</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-gray-900 border border-gray-800 px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-purple-800/50 px-5 py-4">
          <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">Unread</p>
          <p className="text-3xl font-bold text-purple-300">{unread}</p>
        </div>
      </div>

      {/* Table */}
      <AccessRequestsTable
        initial={requests.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
