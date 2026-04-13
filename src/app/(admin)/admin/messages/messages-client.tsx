"use client";

import { useState } from "react";
import {
  Mail, MailOpen, Trash2, Archive, ArchiveRestore,
  ExternalLink, ChevronDown, ChevronUp, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  senderName: string;
  senderEmail: string;
  website: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
};

interface Props {
  initialMessages: Message[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

export function MessagesClient({ initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"inbox" | "archived">("inbox");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const displayed = messages.filter((m) =>
    filter === "inbox" ? !m.isArchived : m.isArchived
  );
  const unreadCount = messages.filter((m) => !m.isRead && !m.isArchived).length;

  async function patchMessage(id: string, updates: Partial<Message>) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    }
    setLoadingId(null);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Permanently delete this message?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setLoadingId(null);
  }

  async function markAllRead() {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  }

  function handleExpand(msg: Message) {
    const isOpening = expandedId !== msg.id;
    setExpandedId(isOpening ? msg.id : null);
    // Auto-mark as read when opened
    if (isOpening && !msg.isRead) {
      patchMessage(msg.id, { isRead: true });
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs + actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["inbox", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
              {f === "inbox" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-blue-600 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && filter === "inbox" && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Message list */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Mail className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filter === "inbox"
              ? "No messages yet. When readers contact you, they'll appear here."
              : "No archived messages."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {displayed.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className={`transition-colors ${
                  !msg.isRead && !msg.isArchived ? "bg-blue-50/40" : ""
                }`}
              >
                {/* Row header — click to expand */}
                <button
                  className="w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-colors"
                  onClick={() => handleExpand(msg)}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {!msg.isRead && !msg.isArchived ? (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm truncate ${!msg.isRead && !msg.isArchived ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                          {msg.senderName}
                          <span className="ml-1.5 font-normal text-gray-400 text-xs">
                            &lt;{msg.senderEmail}&gt;
                          </span>
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      {msg.subject && (
                        <p className={`text-sm mt-0.5 truncate ${!msg.isRead && !msg.isArchived ? "text-gray-700" : "text-gray-500"}`}>
                          {msg.subject}
                        </p>
                      )}
                      {!isExpanded && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {msg.message}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-gray-300 mt-0.5">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-5 pb-5">
                    {/* Message body */}
                    <div className="ml-5 bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    {/* Metadata */}
                    <div className="ml-5 mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>
                        Received{" "}
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.website && (
                        <a
                          href={msg.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          {msg.website}
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-5 mt-4 flex items-center gap-2 flex-wrap">
                      <a
                        href={`mailto:${msg.senderEmail}${msg.subject ? `?subject=Re: ${encodeURIComponent(msg.subject)}` : ""}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Reply by email
                      </a>

                      <button
                        onClick={() => patchMessage(msg.id, { isRead: !msg.isRead })}
                        disabled={loadingId === msg.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {msg.isRead ? (
                          <><Mail className="h-4 w-4" />Mark unread</>
                        ) : (
                          <><MailOpen className="h-4 w-4" />Mark read</>
                        )}
                      </button>

                      <button
                        onClick={() => patchMessage(msg.id, { isArchived: !msg.isArchived })}
                        disabled={loadingId === msg.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {msg.isArchived ? (
                          <><ArchiveRestore className="h-4 w-4" />Move to inbox</>
                        ) : (
                          <><Archive className="h-4 w-4" />Archive</>
                        )}
                      </button>

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={loadingId === msg.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-100 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
