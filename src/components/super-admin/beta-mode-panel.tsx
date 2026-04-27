"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Loader2, Check, Power, KeyRound, Plus, Trash2,
  Copy, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

type InviteCode = {
  id:        string;
  code:      string;
  label:     string;
  maxUses:   number;
  usesCount: number;
  expiresAt: string | null;
  createdAt: string;
};

type Props = {
  initialBetaMode:    boolean;
  initialBetaMessage: string;
  initialCodes:       InviteCode[];
};

export function BetaModePanel({ initialBetaMode, initialBetaMessage, initialCodes }: Props) {
  const [betaMode,    setBetaMode]    = useState(initialBetaMode);
  const [message,     setMessage]     = useState(initialBetaMessage);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");
  const [confirmOn,   setConfirmOn]   = useState(false);
  const [confirmOff,  setConfirmOff]  = useState(false);

  // Code management
  const [codes,       setCodes]       = useState<InviteCode[]>(initialCodes);
  const [codesOpen,   setCodesOpen]   = useState(true);
  const [genCount,    setGenCount]    = useState(1);
  const [genMaxUses,  setGenMaxUses]  = useState(1);
  const [genLabel,    setGenLabel]    = useState("");
  const [genExpiry,   setGenExpiry]   = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [genError,    setGenError]    = useState("");
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [copied,      setCopied]      = useState<string | null>(null);

  const refreshCodes = useCallback(async () => {
    const res = await fetch("/api/super-admin/beta/codes");
    if (res.ok) setCodes(await res.json());
  }, []);

  useEffect(() => { refreshCodes(); }, [refreshCodes]);

  // ── Toggle helpers ──────────────────────────────────────────────────────

  async function saveBeta(mode: boolean, msg: string) {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/beta", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ betaMode: mode, betaMessage: msg }),
      });
      if (!res.ok) throw new Error();
      setBetaMode(mode);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
      setConfirmOn(false);
      setConfirmOff(false);
    }
  }

  function handleToggle() {
    if (!betaMode) setConfirmOn(true);
    else           setConfirmOff(true);
  }

  // ── Code generation ─────────────────────────────────────────────────────

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/super-admin/beta/codes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          count:    genCount,
          maxUses:  genMaxUses,
          label:    genLabel,
          expiresAt: genExpiry || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to generate codes.");
      }
      await refreshCodes();
      setGenLabel("");
      setGenExpiry("");
      setGenCount(1);
      setGenMaxUses(1);
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : "Failed to generate codes.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Code deletion ───────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/super-admin/beta/codes/${id}`, { method: "DELETE" });
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Clipboard copy ──────────────────────────────────────────────────────

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const unusedCount = codes.filter((c) => c.usesCount < c.maxUses).length;

  return (
    <div className="space-y-6">

      {/* Status + toggle row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          betaMode
            ? "bg-amber-900/30 border-amber-700 text-amber-300"
            : "bg-green-900/30 border-green-700 text-green-300"
        }`}>
          <span className={`h-2 w-2 rounded-full ${betaMode ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
          {betaMode ? "BETA MODE — invite only" : "GO LIVE — open registration"}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            betaMode
              ? "bg-amber-500 focus:ring-amber-500"
              : "bg-gray-600 hover:bg-gray-500 focus:ring-gray-500"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle beta mode</span>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            betaMode ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Confirm — enable beta */}
      {confirmOn && (
        <div className="rounded-xl bg-amber-900/40 border border-amber-700 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Enable beta mode?</p>
              <p className="text-xs text-amber-400 mt-1">
                New registrations will require an invite code. Google sign-up for new accounts will be blocked.
                Existing accounts and logins are unaffected.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveBeta(true, message)}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
              Yes, enable beta mode
            </button>
            <button
              onClick={() => setConfirmOn(false)}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirm — go live */}
      {confirmOff && (
        <div className="rounded-xl bg-green-900/40 border border-green-700 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-300">Go live — open registration?</p>
              <p className="text-xs text-green-400 mt-1">
                Invite codes will no longer be required. Google sign-up will be re-enabled.
                Existing beta accounts are unaffected.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveBeta(false, message)}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Yes, go live
            </button>
            <button
              onClick={() => setConfirmOff(false)}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Beta message */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">
          Beta message <span className="text-gray-600">(shown on the register page when beta mode is on)</span>
        </label>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. AuthorLoft is currently in private beta. You need an invite code to create an account."
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveBeta(betaMode, message)}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              : saved
              ? <><Check className="h-3.5 w-3.5" /> Saved</>
              : "Save Message"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {/* ── Invite codes ─────────────────────────────────────────────── */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setCodesOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Invite Codes</span>
            <span className="text-xs text-gray-500">
              {codes.length} total · {unusedCount} unused
            </span>
          </div>
          {codesOpen
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {codesOpen && (
          <div className="p-5 space-y-5 bg-gray-900/30">

            {/* Generate form */}
            <form onSubmit={handleGenerate} className="space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Generate new codes</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-gray-500">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-gray-500">Max uses per code</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={genMaxUses}
                    onChange={(e) => setGenMaxUses(Number(e.target.value))}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Label <span className="text-gray-600">(optional, e.g. "Writing group April")</span></label>
                <input
                  type="text"
                  value={genLabel}
                  onChange={(e) => setGenLabel(e.target.value)}
                  maxLength={100}
                  placeholder="Internal note about these codes"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Expiry date <span className="text-gray-600">(optional)</span></label>
                <input
                  type="date"
                  value={genExpiry}
                  onChange={(e) => setGenExpiry(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {genError && <p className="text-xs text-red-400">{genError}</p>}
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {generating
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                  : <><Plus className="h-3.5 w-3.5" /> Generate {genCount > 1 ? `${genCount} codes` : "code"}</>}
              </button>
            </form>

            {/* Code list */}
            {codes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No codes yet. Generate one above.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">All codes</p>
                  <button
                    type="button"
                    onClick={refreshCodes}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {codes.map((c) => {
                    const exhausted = c.usesCount >= c.maxUses;
                    const expired   = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                    const inactive  = exhausted || expired;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${
                          inactive
                            ? "bg-gray-800/30 border-gray-700/50 opacity-60"
                            : "bg-gray-800 border-gray-700"
                        }`}
                      >
                        {/* Code */}
                        <span className={`font-mono text-sm font-bold flex-shrink-0 ${inactive ? "text-gray-500" : "text-white"}`}>
                          {c.code}
                        </span>

                        {/* Label */}
                        {c.label && (
                          <span className="text-xs text-gray-500 truncate flex-1">{c.label}</span>
                        )}
                        {!c.label && <span className="flex-1" />}

                        {/* Uses badge */}
                        <span className={`text-xs flex-shrink-0 px-1.5 py-0.5 rounded ${
                          exhausted ? "bg-red-900/50 text-red-400" : "bg-gray-700 text-gray-300"
                        }`}>
                          {c.usesCount}/{c.maxUses}
                        </span>

                        {/* Expired badge */}
                        {expired && (
                          <span className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-700 text-gray-500">
                            expired
                          </span>
                        )}

                        {/* Copy */}
                        <button
                          type="button"
                          onClick={() => copyCode(c.code)}
                          title="Copy code"
                          className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                        >
                          {copied === c.code
                            ? <Check className="h-3.5 w-3.5 text-green-400" />
                            : <Copy className="h-3.5 w-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          title="Revoke code"
                          className="text-gray-600 hover:text-red-400 flex-shrink-0 disabled:opacity-50"
                        >
                          {deletingId === c.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
