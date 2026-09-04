"use client";

import { useState } from "react";
import { Trash2, MailOpen, Mail } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";

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

  async function deleteRequest(id: string, name: string) {
    if (!confirm(`Delete the access request from "${name}"? This cannot be undone.`)) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/super-admin/access-requests/${id}`, { method: "DELETE" });
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Mail className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No access requests yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-8 px-5 py-3" />
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Intended Use</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Requested</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((r) => (
            <tr
              key={r.id}
              className={`transition-colors hover:bg-gray-50 ${!r.isRead ? "bg-purple-50/40" : ""}`}
            >
              {/* Unread dot */}
              <td className="px-5 py-4">
                {!r.isRead && (
                  <span className="block h-2 w-2 rounded-full bg-purple-500" />
                )}
              </td>

              {/* Name */}
              <td className="px-5 py-4">
                <p className={`font-medium ${r.isRead ? "text-gray-500" : "text-gray-900"}`}>
                  {r.name}
                </p>
              </td>

              {/* Email */}
              <td className="px-5 py-4">
                <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline text-sm">
                  {r.email}
                </a>
              </td>

              {/* Intended use */}
              <td className="px-5 py-4 hidden md:table-cell text-gray-600">{r.usageType}</td>

              {/* Date */}
              <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <IconButton
                    icon={r.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    title={r.isRead ? "Mark as unread" : "Mark as read"}
                    variant="ghost"
                    onClick={() => toggleRead(r.id, !r.isRead)}
                  />
                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    title="Delete"
                    variant="delete"
                    onClick={() => deleteRequest(r.id, r.name)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
