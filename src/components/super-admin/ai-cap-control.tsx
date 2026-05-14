"use client";

import { useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";

type Props = {
  initialCap: number;
};

export function AiCapControl({ initialCap }: Props) {
  const [cap,     setCap]     = useState(initialCap);
  const [input,   setInput]   = useState(String(initialCap));
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [result,  setResult]  = useState<{ updatedAuthors: number } | null>(null);
  const [error,   setError]   = useState("");

  async function save() {
    const newCap = parseInt(input, 10);
    if (isNaN(newCap) || newCap < 0) {
      setError("Please enter a valid number (0 or higher).");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    setResult(null);
    try {
      const res = await fetch("/api/super-admin/ai-cap", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ defaultAiUsageCap: newCap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setCap(data.defaultAiUsageCap);
      setResult({ updatedAuthors: data.updatedAuthors });
      setSaved(true);
      setTimeout(() => { setSaved(false); setResult(null); }, 5000);
    } catch (err: any) {
      setError(err.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = parseInt(input, 10) !== cap;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="space-y-1.5 flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-600">
            Monthly AI Calls (default for all new users)
          </label>
          <input
            type="number"
            min={0}
            max={10000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-400">
            Current baseline: <span className="font-semibold text-gray-600">{cap} calls/month</span>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">How cascade works when you save:</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>Authors whose cap equals the current baseline ({cap}) will be updated to the new value</li>
          <li>Authors with a custom cap (set individually above the baseline) are left unchanged</li>
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !isDirty}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
            : saved
            ? <><Check className="h-3.5 w-3.5" /> Saved</>
            : "Save & Apply"
          }
        </button>

        {saved && result && (
          <p className="text-xs text-green-600 font-medium">
            {result.updatedAuthors === 0
              ? "No authors were at the previous baseline — no changes needed."
              : `Updated ${result.updatedAuthors} author${result.updatedAuthors === 1 ? "" : "s"} to the new cap.`
            }
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
