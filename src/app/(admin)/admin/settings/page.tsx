"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, KeyRound, User, Mail, Banknote, AlertCircle, ExternalLink, Bot, Eye, EyeOff, Trash2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Stripe Connect widget ─────────────────────────────────────────────────────

function StripeConnectSection() {
  const [status, setStatus] = useState<{
    status: "not_connected" | "pending" | "active";
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    requirementsDue?: string[];
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stripe/connect/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ status: "not_connected" }));
  }, []);

  async function handleConnect() {
    setConnectError("");
    setConnecting(true);
    try {
      const res = await fetch("/api/admin/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || "Could not start Stripe Connect. Please try again.");
        return;
      }
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch {
      setConnectError("Network error. Please try again.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Banknote className="h-4 w-4 text-gray-400" />
          Stripe Payouts
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Connect your Stripe account to receive direct sales revenue. A 10% platform fee applies per sale.
        </p>
      </div>

      {!status ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking connection…
        </div>
      ) : status.status === "active" ? (
        /* ── Connected & active ──────────────────────────────────────────── */
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Connected to Stripe</p>
              <p className="text-xs text-green-600 mt-0.5">
                Payments enabled · Payouts enabled · Revenue goes directly to your bank
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Account ID: <span className="font-mono">{status.accountId}</span>
          </p>
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {connecting ? "Opening Stripe…" : "Manage payout settings in Stripe"}
          </button>
        </div>
      ) : status.status === "pending" ? (
        /* ── Account created but onboarding incomplete ───────────────────── */
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Onboarding incomplete</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You need to finish setting up your Stripe account to receive payouts.
              </p>
            </div>
          </div>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Opening Stripe…</>
              : "Continue Stripe setup →"}
          </Button>
        </div>
      ) : (
        /* ── Not connected ───────────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 space-y-1">
            <p className="font-medium">How payouts work</p>
            <p className="text-blue-600 text-xs">
              Connect your Stripe account in a few minutes. When readers buy your books,
              90% goes directly to your bank account. AuthorLoft retains a 10% platform fee.
              You never need to chase invoices or transfer money manually.
            </p>
          </div>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Opening Stripe…</>
              : "Connect Stripe account →"}
          </Button>
          {connectError && (
            <p className="text-sm text-red-600">{connectError}</p>
          )}
        </div>
      )}
    </section>
  );
}

// ── AI Assistant key section ──────────────────────────────────────────────────

function AiKeySection() {
  const [hasKey,   setHasKey]   = useState<boolean | null>(null);
  const [keyValue, setKeyValue] = useState("");
  const [show,     setShow]     = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [msg,      setMsg]      = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/ai-key")
      .then((r) => r.json())
      .then((d) => setHasKey(d.hasKey ?? false))
      .catch(() => setHasKey(false));
  }, []);

  async function handleAction(action: "test" | "save" | "remove") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings/ai-key", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, apiKey: keyValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Something went wrong." });
      } else if (action === "test") {
        setMsg({ type: "success", text: "Key is valid and working." });
      } else if (action === "save") {
        setMsg({ type: "success", text: "API key saved. No monthly limits apply." });
        setHasKey(true);
        setKeyValue("");
      } else {
        setMsg({ type: "success", text: "API key removed. Monthly usage cap now applies." });
        setHasKey(false);
        setKeyValue("");
      }
    } catch {
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="h-4 w-4 text-gray-400" />
          AI Assistant
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Add your own Gemini API key to unlock unlimited AI requests. Without it, a monthly usage cap applies.{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Get a free key at Google AI Studio →
          </a>
        </p>
      </div>

      {hasKey === null ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : hasKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">API key saved</p>
              <p className="text-xs text-green-600 mt-0.5">Your Gemini key is active — no monthly limits apply.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={keyValue}
                onChange={(e) => { setKeyValue(e.target.value); setMsg(null); }}
                placeholder="Enter new key to replace the saved one"
                aria-label="New Gemini API key"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide key" : "Show key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={busy || !keyValue.trim()}
                onClick={() => handleAction("test")}
                className="text-sm"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Test Key
              </Button>
              <Button
                disabled={busy || !keyValue.trim()}
                onClick={() => handleAction("save")}
                className="text-sm"
              >
                Save New Key
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => handleAction("remove")}
                className="text-sm text-red-600 hover:bg-red-50 border-red-200 ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Remove Key
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={keyValue}
              onChange={(e) => { setKeyValue(e.target.value); setMsg(null); }}
              placeholder="Paste your Gemini API key here"
              aria-label="Gemini API key"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide key" : "Show key"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={busy || !keyValue.trim()}
              onClick={() => handleAction("test")}
              className="text-sm"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Test Key
            </Button>
            <Button
              disabled={busy || !keyValue.trim()}
              onClick={() => handleAction("save")}
              className="text-sm"
            >
              Save Key
            </Button>
          </div>
        </div>
      )}

      {msg && (
        <p className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === "success"
            ? "text-green-700 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        }`}>
          {msg.text}
        </p>
      )}
    </section>
  );
}

// ── Admin Theme section ───────────────────────────────────────────────────────

function AdminThemeSection() {
  const [theme, setTheme]   = useState<"dark" | "light" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/theme")
      .then((r) => r.json())
      .then((d) => { if (d.theme) setTheme(d.theme); })
      .catch(() => {});
  }, []);

  async function choose(next: "dark" | "light") {
    if (next === theme) return;
    setTheme(next);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings/theme", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ theme: next }),
      });
      setSaved(true);
      // Reload so the layout re-renders with the new theme
      setTimeout(() => window.location.reload(), 600);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Sun className="h-4 w-4 text-gray-400" />
          Admin Interface Theme
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Choose how your admin area looks. Your preference is saved to your profile and
          applies across devices.
        </p>
      </div>

      {theme === null ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Dark option */}
          <button
            onClick={() => choose("dark")}
            disabled={saving}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            {/* Preview: dark sidebar + dark content */}
            <div className="w-full h-20 rounded-lg overflow-hidden flex" style={{ background: "#111827" }}>
              <div className="w-1/3 flex flex-col gap-1 p-2" style={{ background: "#111827", borderRight: "1px solid #374151" }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-2 rounded w-full" style={{ background: "#374151" }} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-1.5 p-2" style={{ background: "#111827" }}>
                <div className="h-2.5 rounded w-3/4" style={{ background: "#1f2937" }} />
                <div className="h-8 rounded w-full" style={{ background: "#1f2937", border: "1px solid #374151" }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Moon className="h-4 w-4" /> Dark
              {theme === "dark" && <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />}
            </div>
          </button>

          {/* Light option */}
          <button
            onClick={() => choose("light")}
            disabled={saving}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
              theme === "light"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="w-full h-20 rounded-lg bg-[#faf8f5] flex overflow-hidden border border-[#ddd6c8]">
              <div className="w-1/3 bg-[#f2ede4] flex flex-col gap-1 p-2 border-r border-[#ddd6c8]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-2 rounded bg-[#ddd6c8] w-full" />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-1.5 p-2">
                <div className="h-2.5 rounded bg-[#ddd6c8] w-3/4" />
                <div className="h-2 rounded bg-[#e8e0d4] w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Sun className="h-4 w-4" /> Warm Light
              {theme === "light" && <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />}
            </div>
          </button>
        </div>
      )}

      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Theme updated — reloading…
        </p>
      )}
    </section>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function validateForm(): string | null {
    if (!currentPassword) return "Please enter your current password.";
    if (!newPassword) return "Please enter a new password.";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword) return "New passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Success — clear the form
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      {/* ── Account Info ──────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          Account
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {user?.name || "—"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {user?.email || "—"}
            </div>
            <p className="text-xs text-gray-400">
              To change your email address, please contact support.
            </p>
          </div>
        </div>
      </section>

      {/* ── Change Password ───────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <KeyRound className="h-4 w-4 text-gray-400" />
          Change Password
        </h2>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="font-medium text-gray-900">Password updated successfully</p>
            <p className="text-sm text-gray-500">Your new password is active.</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setSuccess(false)}
            >
              Change Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />

            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error === "New passwords do not match.") setError("");
                }}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
              />
              {/* Live match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button type="submit" disabled={saving}>
                {saving
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                  : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ── Stripe Connect ───────────────────────────────────────── */}
      <StripeConnectSection />

      {/* ── AI Assistant ─────────────────────────────────────────── */}
      <AiKeySection />

      {/* ── Admin Theme ──────────────────────────────────────────── */}
      <AdminThemeSection />

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your AuthorLoft account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="text-red-600 hover:bg-red-50 border-red-200"
          onClick={() => alert("To delete your account, please contact support@authorloft.com")}
        >
          Delete Account
        </Button>
      </section>
    </div>
  );
}
