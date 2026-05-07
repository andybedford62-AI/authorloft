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
        <div className="rounded-lg bg-white border border-gray-200 px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
        <div className="rounded-lg bg-white border border-purple-200 px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-xs text-purple-600 uppercase tracking-wide">Unread</span>
          <span className="text-lg font-bold text-purple-700">{unread}</span>
        </div>
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
          <Mail className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No access requests yet.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium w-8"></th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Intended use</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Requested</th>
                <th className="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className={`transition-colors ${
                    r.isRead ? "opacity-60" : "bg-purple-50"
                  }`}
                >
                  <td className="px-5 py-3">
                    {!r.isRead && (
                      <span className="block h-2 w-2 rounded-full bg-purple-500" />
                    )}
                  </td>

                  <td className={`px-5 py-3 font-medium ${r.isRead ? "text-gray-500" : "text-gray-900"}`}>
                    {r.name}
                  </td>

                  <td className="px-5 py-3">
                    <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">
                      {r.email}
                    </a>
                  </td>

                  <td className="px-5 py-3 text-gray-700">{r.usageType}</td>

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
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {r.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteRequest(r.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
