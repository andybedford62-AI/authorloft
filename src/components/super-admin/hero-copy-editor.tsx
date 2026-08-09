"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULTS = {
  heroHeadlineLine1: "They sell your book. They keep your reader.",
  heroHeadlineLine2: "Take both back.",
  heroSubheadline:
    "Every sale through a retailer is a reader you'll never know, never email, never sell to again. AuthorLoft gives you your own storefront, your own list, and 100% of every dollar.",
};

export function HeroCopyEditor({
  initialHeadlineLine1,
  initialHeadlineLine2,
  initialSubheadline,
}: {
  initialHeadlineLine1: string | null;
  initialHeadlineLine2: string | null;
  initialSubheadline: string | null;
}) {
  const [line1, setLine1] = useState(initialHeadlineLine1 ?? "");
  const [line2, setLine2] = useState(initialHeadlineLine2 ?? "");
  const [sub, setSub]     = useState(initialSubheadline ?? "");
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/super-admin/marketing/hero-copy", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          heroHeadlineLine1: line1,
          heroHeadlineLine2: line2,
          heroSubheadline:   sub,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setSuccess(true);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setLine1(""); setLine2(""); setSub("");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Headline — line 1</label>
        <input
          type="text"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder={DEFAULTS.heroHeadlineLine1}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Headline — accent line (italic, gold)</label>
        <input
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          placeholder={DEFAULTS.heroHeadlineLine2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subheadline paragraph</label>
        <textarea
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          placeholder={DEFAULTS.heroSubheadline}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : <><Check className="h-3.5 w-3.5 mr-1.5" />Save</>}
        </Button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Clear (revert to default text)
        </button>
      </div>

      {success && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="h-4 w-4" /> Saved — homepage will show the new copy.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-gray-400">
        Leave a field blank to use the default AuthorLoft copy shown as placeholder text.
      </p>
    </div>
  );
}
