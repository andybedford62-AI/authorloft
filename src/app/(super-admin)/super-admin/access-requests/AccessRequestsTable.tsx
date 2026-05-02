"use client";

import { useState } from "react";
import { Trash2, MailOpen, Mail } from "lucide-react";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  usageType: string;
  isRead: boolean;
  createdAt: string;
}

export function AccessRequestsTable({ initial }: { initial: AccessRequest[] }) {
  const [requests, setRequests] = useState(initial);

  const total = requests.length;
  const unread = requests.filter((r) => !r.isRead).length;

  async function toggleRead(id: string, isRead: boolean) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRead } : r))
    );
    await fetch(`/api/super-admin/access-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
  }

  async function deleteRequest(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/super-admin/access-requests/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold text-white">{total}</span>
        </div>
        <div className="rounded-lg bg-gray-900 border border-purple-800/50 px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-xs text-purple-400 uppercase tracking-wide">Unread</span>
          <span className="text-lg font-bold text-purple-300">{unread}</span>
        </div>
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <Mail className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No access requests yet.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-gray-400 font-medium w-8"></th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Intended use</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Requested</th>
                <th className="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-800 last:border-0 transition-colors ${
                    r.isRead ? "opacity-60" : "bg-purple-950/20"
                  }`}
                >
                  <td className="px-5 py-3">
                    {!r.isRead && (
                      <span className="block h-2 w-2 rounded-full bg-purple-400" />
                    )}
                  </td>

                  <td className={`px-5 py-3 font-medium ${r.isRead ? "text-gray-400" : "text-white"}`}>
                    {r.name}
                  </td>

                  <td className="px-5 py-3">
                    <a href={`mailto:${r.email}`} className="text-blue-400 hover:underline">
                      {r.email}
                    </a>
                  </td>

                  <td className="px-5 py-3 text-gray-300">{r.usageType}</td>

                  <td className="px-5 py-3 text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleRead(r.id, !r.isRead)}
                        title={r.isRead ? "Mark as unread" : "Mark as read"}
                        className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        {r.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteRequest(r.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
