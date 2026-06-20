"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertTriangle, ShieldAlert, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Settings = {
  id: string;
  enabled: boolean;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  costWarnCentsPerDay: number;
  costDisableCentsPerDay: number;
  adminAlertEmails: string;
  updatedAt: string | Date;
};

const MODEL_OPTIONS = [
  { value: "gemini-2.5-flash",     label: "Gemini 2.5 Flash (recommended, fastest)" },
  { value: "gemini-2.5-flash-lite",label: "Gemini 2.5 Flash Lite (cheapest)" },
  { value: "gemini-2.5-pro",       label: "Gemini 2.5 Pro (highest quality, slower)" },
];

function centsToDollarString(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarStringToCents(input: string): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function SocialPromoteSettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [model, setModel] = useState(initial.model);
  const [timeoutMs, setTimeoutMs] = useState(initial.timeoutMs.toString());
  const [maxOutputTokens, setMaxOutputTokens] = useState(initial.maxOutputTokens.toString());
  const [warnDollars, setWarnDollars] = useState(centsToDollarString(initial.costWarnCentsPerDay));
  const [disableDollars, setDisableDollars] = useState(centsToDollarString(initial.costDisableCentsPerDay));
  const [adminAlertEmails, setAdminAlertEmails] = useState(initial.adminAlertEmails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showCostHelp, setShowCostHelp] = useState(false);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/super-admin/social-promote/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        model,
        timeoutMs: parseInt(timeoutMs) || 30000,
        maxOutputTokens: parseInt(maxOutputTokens) || 800,
        costWarnCentsPerDay: dollarStringToCents(warnDollars),
        costDisableCentsPerDay: dollarStringToCents(disableDollars),
        adminAlertEmails,
      }),
    });
    if (res.ok) {
      setSavedAt(new Date());
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save settings.");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {showCostHelp && <CostHelpModal onClose={() => setShowCostHelp(false)} />}

      {/* Kill switch — prominent at top */}
      <div className={`p-4 rounded-xl border ${enabled ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {enabled ? (
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-green-700" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-700" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Social Promote is {enabled ? "enabled" : "disabled"}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {enabled
                  ? "Authors on eligible plans can generate posts."
                  : "Authors will see a friendly maintenance message instead of the generator."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            title={enabled ? "Click to disable" : "Click to enable"}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              enabled ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Model & limits */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Model & limits</h3>

        <div>
          <label className={labelCls}>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Override only if quality issues arise. Flash is the default for cost and speed reasons.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Generation timeout (ms)</label>
            <input
              type="number"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(e.target.value)}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Server-side cap. Default 30000 (30s).</p>
          </div>
          <div>
            <label className={labelCls}>Max output tokens</label>
            <input
              type="number"
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(e.target.value)}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Hard cap per generation. Default 800.</p>
          </div>
        </div>
      </div>

      {/* Cost ceilings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cost ceilings</h3>
          <button
            type="button"
            onClick={() => setShowCostHelp(true)}
            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:underline"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            How are costs calculated?
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Warn at (USD / day)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={warnDollars}
                onChange={(e) => setWarnDollars(e.target.value)}
                className={inputCls + " pl-7"}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Sends an alert email to admins. Does not block generations.</p>
          </div>
          <div>
            <label className={labelCls}>Auto-disable at (USD / day)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={disableDollars}
                onChange={(e) => setDisableDollars(e.target.value)}
                className={inputCls + " pl-7"}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Flips the kill switch off automatically when reached.</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Admin alert emails</label>
          <input
            value={adminAlertEmails}
            onChange={(e) => setAdminAlertEmails(e.target.value)}
            placeholder="alerts@example.com, ops@example.com"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            Comma-separated. If blank, falls back to <code className="bg-gray-100 px-1 rounded">SOCIAL_PROMOTE_ADMIN_EMAILS</code> env var.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        {savedAt && (
          <span className="text-xs text-gray-400 mr-auto">Saved {savedAt.toLocaleTimeString()}</span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save settings</>}
        </Button>
      </div>
    </div>
  );
}

function CostHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">How Social Promote costs are calculated</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 text-sm">
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Per-generation cost (Gemini 2.5 Flash)</h4>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-xs leading-relaxed">
              Input  ≈ 600 tokens × $0.30 / 1M = <span className="text-gray-900 font-semibold">$0.00018</span><br />
              Output ≈ 250 tokens × $2.50 / 1M = <span className="text-gray-900 font-semibold">$0.000625</span><br />
              <span className="text-purple-700 font-semibold">Total ≈ $0.0008 per generation</span> (less than a tenth of a cent)
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Typical input includes the system prompt, promo type template, book or news context, author voice description,
              and platform addendum. Output is capped by the "Max output tokens" setting above.
            </p>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Realistic daily spend at scale</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gens / day</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost / day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr><td className="px-3 py-2">10 authors (beta)</td>          <td className="px-3 py-2 font-mono">100</td>    <td className="px-3 py-2 font-mono font-semibold">$0.08</td></tr>
                  <tr><td className="px-3 py-2">100 authors (early launch)</td> <td className="px-3 py-2 font-mono">1,000</td>  <td className="px-3 py-2 font-mono font-semibold">$0.80</td></tr>
                  <tr><td className="px-3 py-2">500 authors (steady-state)</td> <td className="px-3 py-2 font-mono">5,000</td>  <td className="px-3 py-2 font-mono font-semibold">$4.00</td></tr>
                  <tr><td className="px-3 py-2">1,000 authors (Premium-heavy)</td><td className="px-3 py-2 font-mono">10,000</td><td className="px-3 py-2 font-mono font-semibold">$8.00</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested ceilings by stage</h4>
            <p className="text-xs text-gray-500 mb-2">
              These are <em>abuse-protection</em> ceilings, not "expected spend" caps. Set them so a runaway loop or
              prompt-injection abuse trips the alert well before becoming expensive.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Warn at</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto-disable at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="bg-purple-50/40">
                    <td className="px-3 py-2">Beta launch (recommended)</td>
                    <td className="px-3 py-2 font-mono font-semibold text-purple-700">$10 / day</td>
                    <td className="px-3 py-2 font-mono font-semibold text-purple-700">$50 / day</td>
                  </tr>
                  <tr><td className="px-3 py-2">100+ paid authors</td><td className="px-3 py-2 font-mono">$25 / day</td><td className="px-3 py-2 font-mono">$100 / day</td></tr>
                  <tr><td className="px-3 py-2">500+ paid authors</td><td className="px-3 py-2 font-mono">$50 / day</td><td className="px-3 py-2 font-mono">$200 / day</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-900">
              <strong>Note on the warn ceiling:</strong> reaching it triggers an alert email to the "Admin alert emails"
              list above. Reaching the auto-disable ceiling flips the kill switch off automatically — authors will see a
              friendly maintenance message until you investigate and re-enable.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
