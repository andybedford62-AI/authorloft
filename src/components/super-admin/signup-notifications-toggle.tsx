"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, Check } from "lucide-react";

type Props = { initialEnabled: boolean };

export function SignupNotificationsToggle({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  async function toggle(value: boolean) {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/beta", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ newSignupNotifications: value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEnabled(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            enabled
              ? "bg-green-900/30 border-green-700 text-green-300"
              : "bg-gray-800 border-gray-700 text-gray-400"
          }`}>
            {enabled
              ? <><Bell className="h-3 w-3" /> NOTIFICATIONS ON</>
              : <><BellOff className="h-3 w-3" /> NOTIFICATIONS OFF</>
            }
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggle(!enabled)}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            enabled
              ? "bg-green-600 focus:ring-green-500"
              : "bg-gray-600 hover:bg-gray-500 focus:ring-gray-500"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle signup notifications</span>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {saving && <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</p>}
        {saved  && <p className="text-xs text-green-400 flex items-center gap-1"><Check className="h-3 w-3" /> Saved</p>}
        {error  && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <p className="text-xs text-gray-500">
        When enabled, you will receive an email at <span className="text-gray-300">{process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ?? "your admin email"}</span> whenever a new author creates an account.
      </p>
    </div>
  );
}
