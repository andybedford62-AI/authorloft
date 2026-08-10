"use client";

import { useState } from "react";
import { Star, Check, X, Trash2, RotateCcw } from "lucide-react";

type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED";
type ItemType = "book" | "course";

interface FeedbackItem {
  id: string;
  itemType: ItemType;
  itemId: string; // bookId or courseId, depending on itemType
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string | null;
  status: FeedbackStatus;
  createdAt: string;
  itemTitle: string;
}

interface Props {
  initialFeedback: FeedbackItem[];
}

export function FeedbackModeration({ initialFeedback }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [activeTab, setActiveTab] = useState<FeedbackStatus>("PENDING");
  const [loading, setLoading] = useState<string | null>(null);

  const byStatus: Record<FeedbackStatus, FeedbackItem[]> = {
    PENDING:  feedback.filter((f) => f.status === "PENDING"),
    APPROVED: feedback.filter((f) => f.status === "APPROVED"),
    REJECTED: feedback.filter((f) => f.status === "REJECTED"),
  };

  function apiPath(item: FeedbackItem) {
    const segment = item.itemType === "book" ? "books" : "courses";
    return `/api/admin/${segment}/${item.itemId}/feedback/${item.id}`;
  }

  async function updateStatus(item: FeedbackItem, status: FeedbackStatus) {
    setLoading(item.id);
    try {
      const res = await fetch(apiPath(item), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFeedback((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status } : f)),
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteFeedback(item: FeedbackItem) {
    if (!confirm(`Delete feedback from "${item.reviewerName}"? This cannot be undone.`)) return;
    setLoading(item.id);
    try {
      const res = await fetch(apiPath(item), { method: "DELETE" });
      if (res.ok) {
        setFeedback((prev) => prev.filter((f) => f.id !== item.id));
      }
    } finally {
      setLoading(null);
    }
  }

  const tabs: { key: FeedbackStatus; label: string }[] = [
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const items = byStatus[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === tab.key
                ? "bg-white border border-b-white border-gray-200 -mb-px text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {byStatus[tab.key].length > 0 && (
              <span
                className={`ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  tab.key === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {byStatus[tab.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No {activeTab.toLowerCase()} feedback yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Item label */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    {item.itemTitle}
                    <span className={`ml-2 normal-case font-medium px-1.5 py-0.5 rounded-full text-[10px] ${
                      item.itemType === "book" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                    }`}>
                      {item.itemType === "book" ? "Book" : "Course"}
                    </span>
                  </p>
                  {/* Reviewer + stars */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.reviewerName}
                    </span>
                    <span className="text-xs text-gray-400">{item.reviewerEmail}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            n <= item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Comment */}
                  {item.comment && (
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  )}
                  {/* Date */}
                  <p className="mt-1.5 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {activeTab === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateStatus(item, "APPROVED")}
                        disabled={loading === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(item, "REJECTED")}
                        disabled={loading === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === "APPROVED" && (
                    <button
                      onClick={() => updateStatus(item, "PENDING")}
                      disabled={loading === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Unpublish
                    </button>
                  )}
                  {activeTab === "REJECTED" && (
                    <button
                      onClick={() => updateStatus(item, "PENDING")}
                      disabled={loading === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => deleteFeedback(item)}
                    disabled={loading === item.id}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
