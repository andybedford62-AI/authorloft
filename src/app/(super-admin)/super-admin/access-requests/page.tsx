import { prisma } from "@/lib/db";
import { Inbox } from "lucide-react";

export default async function AccessRequestsPage() {
  const requests = await prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Inbox className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Access Requests</h1>
        <span className="ml-2 rounded-full bg-purple-900 text-purple-300 text-xs font-semibold px-2.5 py-0.5">
          {requests.length}
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <Inbox className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No access requests yet.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Intended use</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-900/50"}`}
                >
                  <td className="px-5 py-3 text-white font-medium">{r.name}</td>
                  <td className="px-5 py-3">
                    <a href={`mailto:${r.email}`} className="text-blue-400 hover:underline">
                      {r.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{r.usageType}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {r.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
