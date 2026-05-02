import { prisma } from "@/lib/db";
import { Inbox } from "lucide-react";
import { AccessRequestsTable } from "./AccessRequestsTable";

export default async function AccessRequestsPage() {
  const requests = await prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Inbox className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Access Requests</h1>
      </div>

      <AccessRequestsTable
        initial={requests.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
