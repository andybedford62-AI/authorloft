"use client";

import { useState } from "react";
import { Bell, CheckCircle, Trash2, ChevronDown } from "lucide-react";
import type { ArcReaderRow } from "./arc-invite-modal";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Applied",    color: "bg-amber-100 text-amber-700" },
  INVITED:    { label: "Invited",    color: "bg-blue-100 text-blue-700"   },
  DOWNLOADED: { label: "Downloaded", color: "bg-purple-100 text-purple-700" },
  REVIEWED:   { label: "Reviewed",   color: "bg-green-100 text-green-700" },
  DECLINED:   { label: "Declined",   color: "bg-gray-100 text-gray-500"   },
};

const REVIEW_PLATFORMS = ["AMAZON", "GOODREADS", "BOOKBUB", "BLOG", "OTHER"];

type Props = {
  bookId: string;
  arcCopyId: string;
  readers: ArcReaderRow[];
  onUpdate: (updated: ArcReaderRow) => void;
  onRemove: (id: string) => void;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
};

export function ArcReaderTable({ bookId, arcCopyId, readers, onUpdate, onRemove, onApprove, onDecline }: Props) {
  const [reminding, setReminding] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [editReviewUrl, setEditReviewUrl] = useState<Record<string, string>>({});
  const [editPlatform, setEditPlatform] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleRemind(reader: ArcReaderRow) {
    setReminding(reader.id);
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}/remind`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) onUpdate(data);
      else alert(data.error ?? "Could not send reminder");
    } finally {
      setReminding(null);
    }
  }

  async function handleMarkReviewed(reader: ArcReaderRow) {
    setSaving(reader.id);
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REVIEWED",
            reviewPlatform: editPlatform[reader.id] ?? reader.reviewPlatform ?? null,
            reviewUrl: editReviewUrl[reader.id] ?? reader.reviewUrl ?? null,
            notes: editNotes[reader.id] ?? reader.notes ?? null,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) onUpdate(data);
      else alert(data.error ?? "Could not update reader");
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveNotes(reader: ArcReaderRow) {
    setSaving(reader.id);
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewPlatform: editPlatform[reader.id] ?? reader.reviewPlatform ?? null,
            reviewUrl: editReviewUrl[reader.id] ?? reader.reviewUrl ?? null,
            notes: editNotes[reader.id] ?? reader.notes ?? null,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        onUpdate(data);
        setExpanded(null);
      } else {
        alert(data.error ?? "Could not save");
      }
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(reader: ArcReaderRow) {
    if (!confirm(`Remove ${reader.name} from this ARC list?`)) return;
    const res = await fetch(
      `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}`,
      { method: "DELETE" }
    );
    if (res.ok) onRemove(reader.id);
    else alert("Could not remove reader");
  }

  async function handleApprove(reader: ArcReaderRow) {
    setSaving(reader.id);
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        }
      );
      const data = await res.json();
      if (res.ok) { onUpdate(data); onApprove?.(reader.id); }
      else alert(data.error ?? "Could not approve");
    } finally {
      setSaving(null);
    }
  }

  async function handleDecline(reader: ArcReaderRow) {
    setSaving(reader.id);
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arcCopyId}/readers/${reader.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "decline" }),
        }
      );
      const data = await res.json();
      if (res.ok) { onUpdate(data); onDecline?.(reader.id); }
      else alert(data.error ?? "Could not decline");
    } finally {
      setSaving(null);
    }
  }

  if (readers.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No readers yet. Use the <strong>Invite Reader</strong> button above to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">Reader</th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">Status</th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600 hidden sm:table-cell">Downloaded</th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600 hidden md:table-cell">Reviewed</th>
            <th className="px-3 py-2.5 text-right font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {readers.map((reader) => {
            const badge = STATUS_LABELS[reader.status] ?? STATUS_LABELS.INVITED;
            const isExpanded = expanded === reader.id;
            return (
              <>
                <tr key={reader.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-800">{reader.name}</p>
                    <p className="text-xs text-gray-400">{reader.email}</p>
                    {reader.source === "APPLIED" && (
                      <span className="text-xs text-amber-600 font-medium">Applied</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell">
                    {reader.downloadedAt
                      ? new Date(reader.downloadedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs hidden md:table-cell">
                    {reader.reviewedAt
                      ? new Date(reader.reviewedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      {reader.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(reader)}
                            disabled={saving === reader.id}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(reader)}
                            disabled={saving === reader.id}
                            className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {(reader.status === "INVITED" || reader.status === "DOWNLOADED") && (
                        <button
                          type="button"
                          title="Send reminder"
                          onClick={() => handleRemind(reader)}
                          disabled={reminding === reader.id}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {reader.status !== "REVIEWED" && reader.status !== "PENDING" && (
                        <button
                          type="button"
                          title="Mark as reviewed"
                          onClick={() => handleMarkReviewed(reader)}
                          disabled={saving === reader.id}
                          className="p-1.5 rounded hover:bg-gray-100 text-green-600 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Expand / edit notes"
                        onClick={() => {
                          setExpanded(isExpanded ? null : reader.id);
                          if (!isExpanded) {
                            setEditNotes((p) => ({ ...p, [reader.id]: reader.notes ?? "" }));
                            setEditReviewUrl((p) => ({ ...p, [reader.id]: reader.reviewUrl ?? "" }));
                            setEditPlatform((p) => ({ ...p, [reader.id]: reader.reviewPlatform ?? "" }));
                          }
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <button
                        type="button"
                        title="Remove reader"
                        onClick={() => handleDelete(reader)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${reader.id}-expand`} className="bg-gray-50">
                    <td colSpan={5} className="px-3 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Review platform</label>
                          <select
                            value={editPlatform[reader.id] ?? ""}
                            onChange={(e) => setEditPlatform((p) => ({ ...p, [reader.id]: e.target.value }))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                          >
                            <option value="">— none —</option>
                            {REVIEW_PLATFORMS.map((p) => (
                              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Review URL</label>
                          <input
                            type="url"
                            value={editReviewUrl[reader.id] ?? ""}
                            onChange={(e) => setEditReviewUrl((p) => ({ ...p, [reader.id]: e.target.value }))}
                            placeholder="https://..."
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Notes (private)</label>
                          <input
                            type="text"
                            value={editNotes[reader.id] ?? ""}
                            onChange={(e) => setEditNotes((p) => ({ ...p, [reader.id]: e.target.value }))}
                            placeholder="Internal notes…"
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(reader)}
                          disabled={saving === reader.id}
                          className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          {saving === reader.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
