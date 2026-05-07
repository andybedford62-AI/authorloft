"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  bookId: string;
  arcCopyId: string;
  onAdded: (reader: ArcReaderRow) => void;
  onClose: () => void;
};

export type ArcReaderRow = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string;
  reviewPlatform: string | null;
  reviewUrl: string | null;
  notes: string | null;
  invitedAt: string | null;
  downloadedAt: string | null;
  reviewedAt: string | null;
  reminderSentAt: string | null;
  disclaimerAcknowledgedAt: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
};

export function ArcInviteModal({ bookId, arcCopyId, onAdded, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc/${arcCopyId}/readers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), tokenExpiresAt: tokenExpiresAt || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to invite reader");
        return;
      }
      onAdded(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Invite Reader</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Link expires (optional — overrides ARC default)
            </label>
            <input
              type="date"
              value={tokenExpiresAt}
              onChange={(e) => setTokenExpiresAt(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
