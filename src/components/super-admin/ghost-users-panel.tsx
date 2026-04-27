"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Mail, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface GhostUser {
  id:                       string;
  name:                     string;
  displayName:              string;
  email:                    string;
  slug:                     string;
  emailVerified:            string;
  onboardingReminderSentAt: string | null;
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export function GhostUsersPanel() {
  const [users,    setUsers]    = useState<GhostUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<string | null>(null); // authorId in progress
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/super-admin/ghost-users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(authorId: string, action: "remind" | "delete") {
    setActing(authorId);
    try {
      const res = await fetch("/api/super-admin/ghost-users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, authorId }),
      });
      if (!res.ok) throw new Error();
      showToast(action === "remind" ? "Reminder sent." : "Account deleted.", true);
      await load();
    } catch {
      showToast("Action failed — please try again.", false);
    } finally {
      setActing(null);
    }
  }

  async function runCleanup() {
    setRunningCleanup(true);
    try {
      const res  = await fetch("/api/cron/onboarding-cleanup", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Cleanup run: ${data.reminded} reminded, ${data.deleted} deleted.`, true);
        await load();
      } else {
        showToast("Cleanup failed.", false);
      }
    } catch {
      showToast("Cleanup failed.", false);
    } finally {
      setRunningCleanup(false);
    }
  }

  const approaching14 = users.filter((u) => daysSince(u.emailVerified) >= 12);
  const needsReminder = users.filter((u) => !u.onboardingReminderSentAt && daysSince(u.emailVerified) >= 5);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Authors who verified their email but have not added a book.
          </p>
          {approaching14.length > 0 && (
            <p className="text-xs text-red-600 mt-0.5 font-medium">
              {approaching14.length} account{approaching14.length !== 1 ? "s" : ""} will be auto-deleted in ≤2 days.
            </p>
          )}
          {needsReminder.length > 0 && (
            <p className="text-xs text-amber-600 mt-0.5 font-medium">
              {needsReminder.length} account{needsReminder.length !== 1 ? "s" : ""} overdue for a reminder.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
          No ghost accounts — all verified authors have added a book.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reminder</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const days    = daysSince(u.emailVerified);
                const isActing = acting === u.id;
                const urgent  = days >= 12;
                const name    = u.displayName || u.name;

                return (
                  <tr key={u.id} className={`${urgent ? "bg-red-50/40" : "bg-white"} hover:bg-gray-50/60 transition-colors`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-400 font-mono">{u.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span className={`font-medium ${urgent ? "text-red-600" : days >= 7 ? "text-amber-600" : "text-gray-700"}`}>
                        {days}d ago
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.onboardingReminderSentAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          Not sent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {urgent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Deletes soon
                        </span>
                      ) : days >= 7 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Reminded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Watching
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => act(u.id, "remind")}
                          disabled={isActing}
                          title="Send reminder email now"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                          Remind
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete account for ${name} (${u.email})? This cannot be undone.`)) {
                              act(u.id, "delete");
                            }
                          }}
                          disabled={isActing}
                          title="Delete this ghost account now"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Automated cleanup runs nightly at 4am — day-7 reminder, day-14 deletion.
      </p>
    </div>
  );
}
