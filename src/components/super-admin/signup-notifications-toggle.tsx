"use client";

import { useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";

type Props = {
  initialEnabled: boolean;
  initialEmail:   string;
};

export function SignupNotificationsToggle({ initialEnabled, initialEmail }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [email,   setEmail]   = useState(initialEmail);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  async function save(newEnabled: boolean, newEmail: string) {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/beta", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ newSignupNotifications: newEnabled, signupNotificationEmail: newEmail }),
      });
      if (!res.ok) throw new Error();
      setEnabled(newEnabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Status + toggle row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          enabled
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-gray-100 border-gray-300 text-gray-500"
        }`}>
          {enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {enabled ? "NOTIFICATIONS ON" : "NOTIFICATIONS OFF"}
        </div>

        <button
          type="button"
          onClick={() => save(!enabled, email)}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            enabled
              ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle signup notifications</span>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Email input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600">
          Notification Email <span className="text-gray-400">(receives alert on every new signup)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-400">
          Notifications are sent even when this is different from your account email.
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => save(enabled, email)}
          disabled={saving || !email.trim()}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
            : saved
            ? <><Check className="h-3.5 w-3.5" /> Saved</>
            : "Save"
          }
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
