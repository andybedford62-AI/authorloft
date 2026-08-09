"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Check, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  initialMode: boolean;
  initialMessage: string;
};

export function MaintenanceToggle({ initialMode, initialMessage }: Props) {
  const [maintenanceMode, setMaintenanceMode] = useState(initialMode);
  const [message, setMessage]                 = useState(initialMessage);
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [error, setError]                     = useState("");
  const [confirmPending, setConfirmPending]   = useState(false);

  async function save(mode: boolean, msg: string) {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode: mode, maintenanceMessage: msg }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMaintenanceMode(mode);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
      setConfirmPending(false);
    }
  }

  function handleToggle() {
    if (!maintenanceMode) {
      // Enabling — require confirmation first
      setConfirmPending(true);
    } else {
      // Disabling — no confirmation needed
      save(false, message);
    }
  }

  return (
    <div className="space-y-5">

      {/* Status + toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            maintenanceMode
              ? "bg-red-50 border-red-300 text-red-700"
              : "bg-green-50 border-green-300 text-green-700"
          }`}>
            <span className={`h-2 w-2 rounded-full ${maintenanceMode ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
            {maintenanceMode ? "MAINTENANCE ON" : "SITE ONLINE"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            maintenanceMode
              ? "bg-red-600 focus:ring-red-500"
              : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle maintenance mode</span>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            maintenanceMode ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirmPending && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Enable maintenance mode?</p>
              <p className="text-xs text-red-600 mt-1">
                All logins and new registrations will be blocked immediately. The marketing page, demo site, and email contact will remain accessible.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => save(true, message)}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
              Yes, enable maintenance
            </button>
            <Button variant="ghost" onClick={() => setConfirmPending(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Custom message */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">
          Maintenance Message <span className="text-gray-400">(shown on the offline page)</span>
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. We're performing scheduled upgrades. We expect to be back online by 3:00 PM EST."
          className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="text-xs text-gray-400">Leave blank to show the default message only.</p>
      </div>

      {/* Save message button */}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={() => save(maintenanceMode, message)} disabled={saving}>
          {saving
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
            : saved
            ? <><Check className="h-4 w-4 mr-2" />Saved</>
            : <><Check className="h-4 w-4 mr-2" />Save Message</>}
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
