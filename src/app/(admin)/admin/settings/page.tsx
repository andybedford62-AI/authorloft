"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, Check, KeyRound, User, Mail, Banknote, AlertCircle, ExternalLink, Bot, Eye, EyeOff, Trash2, Sun, Moon, CreditCard, Zap, Bell, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/use-toast";
import { HelpTip } from "@/components/admin/help-tip";

// ── Subscription & Billing section ───────────────────────────────────────────

type BillingPlan = {
  id: string; name: string; tier: string; description: string | null;
  monthlyPriceCents: number; annualPriceCents: number;
  stripePriceIdMonthly: string | null; stripePriceIdAnnual: string | null;
  featuresJson: string | null; badgeColor: string; featuredLabel: string | null;
};

type BillingData = {
  currentTier: string; currentPlanName: string;
  subscription: { currentPeriodEnd: string | null; billingInterval: string; status: string } | null;
  isAdminAssigned: boolean;
  isOnTrial:   boolean;
  trialEndsAt: string | null;
  plans: BillingPlan[];
};

function SubscriptionSection() {
  const [data,     setData]     = useState<BillingData | null>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");
  const [busy,     setBusy]     = useState<string | null>(null); // priceId being loaded
  const [portalBusy, setPortalBusy] = useState(false);
  const [intendedPlan, setIntendedPlan] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/admin/billing").then((r) => r.json()).then(setData).catch(() => {});
    const stored = localStorage.getItem("intendedPlan");
    if (stored) setIntendedPlan(stored);
  }, []);

  async function handleUpgrade(priceId: string) {
    setBusy(priceId);
    try {
      const res  = await fetch("/api/admin/stripe/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId }),
      });
      const json = await res.json();
      if (json.url) {
        localStorage.removeItem("intendedPlan");
        window.open(json.url, "_blank");
      } else if (json.error) {
        toast("error", json.error);
      } else {
        toast("error", "Unable to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      toast("error", "Network error. Please check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePortal() {
    setPortalBusy(true);
    try {
      const res  = await fetch("/api/admin/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.open(json.url, "_blank");
      } else if (json.error) {
        toast("error", json.error);
      } else {
        toast("error", "Unable to open billing portal. Please try again.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast("error", "Network error. Please try again.");
    } finally {
      setPortalBusy(false);
    }
  }

  const isFree          = !data || data.currentTier === "FREE";
  const isAdminAssigned = data?.isAdminAssigned ?? false;
  const isOnTrial       = data?.isOnTrial ?? false;
  const trialExpiryStr  = data?.trialEndsAt
    ? new Date(data.trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const trialDaysLeft   = data?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(data.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const renewalDate = data?.subscription?.currentPeriodEnd
    ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <section id="billing" className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          Subscription &amp; Billing
        </h2>
        <p className="text-xs text-gray-400 mt-1">Manage your AuthorLoft plan.</p>
      </div>

      {!data ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Intended plan banner — shown after signup from marketing page */}
          {intendedPlan && isFree && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">
                  You&apos;re one step away from {intendedPlan.charAt(0).toUpperCase() + intendedPlan.slice(1)}!
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Select the {intendedPlan.charAt(0).toUpperCase() + intendedPlan.slice(1)} plan below to complete your upgrade.
                </p>
              </div>
              <button
                onClick={() => { setIntendedPlan(null); localStorage.removeItem("intendedPlan"); }}
                className="text-blue-400 hover:text-blue-600 text-xs flex-shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current plan */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">{data.currentPlanName}</p>
              {renewalDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.subscription?.status === "active" ? "Renews" : "Expires"} {renewalDate}
                </p>
              )}
              {isFree && (
                <p className="text-xs text-gray-400 mt-0.5">Free plan — upgrade to unlock more features</p>
              )}
              {isOnTrial && trialExpiryStr && (
                <p className="text-xs text-amber-600 mt-0.5 font-medium">
                  Trial — expires {trialExpiryStr}
                  {trialDaysLeft !== null && trialDaysLeft > 0 && ` (${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left)`}
                  {trialDaysLeft === 0 && " (expires today)"}
                </p>
              )}
              {isAdminAssigned && !isOnTrial && (
                <p className="text-xs text-gray-400 mt-0.5">Plan assigned by admin</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {isFree ? (
                <p className="text-xs text-gray-400">Upgrade to manage billing</p>
              ) : isOnTrial ? (
                <p className="text-xs text-amber-600 font-medium">Subscribe below to keep access</p>
              ) : isAdminAssigned ? (
                <p className="text-xs text-gray-400">Contact support to manage billing</p>
              ) : (
                <button
                  onClick={handlePortal}
                  disabled={portalBusy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="h-3 w-3" />
                  {portalBusy ? "Opening…" : "Manage billing"}
                </button>
              )}
            </div>
          </div>

          {/* Upgrade options — shown to free users and trial users */}
          {(isFree || isOnTrial) && data.plans.length > 0 && (
            <>
              {/* Monthly / Annual toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInterval("monthly")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    interval === "monthly"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setInterval("annual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    interval === "annual"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Annual <span className="text-green-600 ml-1">2 mo. free</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {data.plans.map((plan) => {
                  const priceId = interval === "annual"
                    ? plan.stripePriceIdAnnual
                    : plan.stripePriceIdMonthly;
                  const cents = interval === "annual"
                    ? plan.annualPriceCents
                    : plan.monthlyPriceCents;
                  const dollars = cents > 0 ? `$${(cents / 100).toFixed(2)}` : null;
                  const features: string[] = plan.featuresJson
                    ? JSON.parse(plan.featuresJson)
                    : [];

                  return (
                    <div
                      key={plan.id}
                      className="border border-gray-200 rounded-xl p-5 space-y-4 flex flex-col"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          {plan.featuredLabel && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {plan.featuredLabel}
                            </span>
                          )}
                        </div>
                        {dollars && (
                          <p className="text-2xl font-bold text-gray-900">
                            {dollars}
                            <span className="text-sm font-normal text-gray-400">
                              /{interval === "annual" ? "yr" : "mo"}
                            </span>
                          </p>
                        )}
                      </div>
                      {features.length > 0 && (
                        <ul className="space-y-1 flex-1">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        onClick={() => priceId && handleUpgrade(priceId)}
                        disabled={!priceId || busy === priceId}
                        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {busy === priceId
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
                          : !priceId
                          ? "Coming soon"
                          : <><Zap className="h-4 w-4" /> {isOnTrial && data.currentTier === plan.tier ? `Subscribe · Keep ${plan.name}` : `Upgrade to ${plan.name}`}</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

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
          <HelpTip id="stripe-connect" />
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
          <p className="text-xs text-gray-500">
            Not sure what&apos;s missing? Open your{" "}
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
            >
              Stripe dashboard <ExternalLink className="h-3 w-3" />
            </a>
            {" "}— Stripe shows exactly which verification step is outstanding.{" "}
            <a href="/admin/help?article=ha07" className="text-blue-600 hover:underline">Learn more</a>.
          </p>
        </div>
      ) : (
        /* ── Not connected ───────────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 space-y-2">
            <p className="font-medium">First time? Here&apos;s the short version.</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Stripe is the company that handles card payments and sends the money to your bank.
              This is <strong>separate</strong> from your AuthorLoft subscription — you don&apos;t need
              it to use the platform, only if you want to sell books directly. Setup takes about
              5–10 minutes and Stripe walks you through every screen.
            </p>
            <p className="text-blue-700 text-xs leading-relaxed">
              When a reader buys, <strong>90% goes straight to your bank</strong> and AuthorLoft
              keeps a 10% platform fee. No invoices, no manual transfers.
            </p>
            <p className="pt-1">
              <a
                href="/admin/help?article=ha_stripe_what"
                className="text-xs font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                Read the full beginner&apos;s guide
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <details className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <summary className="font-medium text-gray-800 cursor-pointer select-none">
              What you&apos;ll need before you click Connect
            </summary>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Personal details</strong> — your full legal name, date of birth, home address, phone</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Bank account info</strong> — routing &amp; account number (US) or sort code &amp; account number (UK/EU)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Tax ID</strong> — your SSN (US individuals), EIN (US businesses), or your country&apos;s equivalent</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Sometimes:</strong> a photo of your driver&apos;s licence or passport — Stripe will ask only if needed</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-500 italic">
              AuthorLoft never sees any of this — it goes straight from you to Stripe.
            </p>
          </details>

          <Button onClick={handleConnect} disabled={connecting}>
            {connecting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Opening Stripe…</>
              : "Connect Stripe account →"}
          </Button>
          <p className="text-xs text-gray-400">
            You&apos;ll be taken to Stripe&apos;s secure site, then sent back here when you&apos;re done.
            If you stop partway, your progress is saved — just come back and click <em>Continue Stripe setup</em>.
          </p>
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
          <HelpTip id="ai-key" />
          <HelpTip id="ai-usage-cap" />
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
                <Check className="h-4 w-4 mr-1.5" /> Save New Key
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => handleAction("remove")}
                className="text-sm ml-auto"
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
              <Check className="h-4 w-4 mr-1.5" />Save Key
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

// ── Email Preferences section ─────────────────────────────────────────────────

function EmailPreferencesSection() {
  const [optOut,   setOptOut]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/email-preferences")
      .then(r => r.json())
      .then(d => setOptOut(d.optOut ?? false))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    const newValue = !optOut;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings/email-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optOut: newValue }),
      });
      setOptOut(newValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setSaving(false); }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Platform Communications</h2>
      </div>
      <p className="text-sm text-gray-500">
        Control whether you receive announcements, offers, and updates from the AuthorLoft team.
      </p>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              role="switch"
              aria-checked={!optOut}
              onClick={handleToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 ${
                !optOut ? "bg-[var(--accent)]" : "bg-gray-200"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${!optOut ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {!optOut ? "Receiving platform emails" : "Opted out of platform emails"}
            </span>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
            {saved  && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
          </label>
          <p className="text-xs text-gray-400">
            You will always receive transactional emails (password resets, billing receipts, order confirmations) regardless of this setting.
          </p>
        </div>
      )}
    </section>
  );
}

// ── Tab types ────────────────────────────────────────────────────────────────

type SettingsTab = "account" | "billing" | "integrations" | "appearance" | "communications" | "danger";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "account",        label: "Account"        },
  { id: "billing",        label: "Billing"        },
  { id: "integrations",   label: "Integrations"   },
  { id: "appearance",     label: "Appearance"     },
  { id: "communications", label: "Communications" },
  { id: "danger",         label: "Danger Zone"    },
];

// ── Showcase opt-in toggle ────────────────────────────────────────────────────

type ShowcaseStyle = "photo" | "book" | "text";

const SHOWCASE_STYLES: { value: ShowcaseStyle; label: string; description: string }[] = [
  { value: "photo", label: "Profile photo",  description: "Your author photo, name, and tagline" },
  { value: "book",  label: "Book cover",     description: "Your featured book cover, name, and tagline" },
  { value: "text",  label: "Text only",      description: "Name and tagline only — no image" },
];

function ShowcaseToggle() {
  const [enabled,  setEnabled]  = useState<boolean | null>(null);
  const [style,    setStyle]    = useState<ShowcaseStyle>("photo");
  const [saving,   setSaving]   = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/admin/settings/showcase")
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.showInShowcase ?? false);
        setStyle(d.showcaseStyle ?? "photo");
      })
      .catch(() => { setEnabled(false); });
  }, []);

  async function patch(updates: { showInShowcase?: boolean; showcaseStyle?: ShowcaseStyle }) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/showcase", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      if (res.ok) {
        if (updates.showInShowcase !== undefined) {
          setEnabled(updates.showInShowcase);
          toast("success", updates.showInShowcase
            ? "Your site will appear in the AuthorLoft showcase."
            : "Your site has been removed from the showcase.");
        }
        if (updates.showcaseStyle !== undefined) {
          setStyle(updates.showcaseStyle);
          toast("success", "Display style updated.");
        }
      } else {
        toast("error", "Could not update showcase setting.");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-400" />
        Marketing Showcase
      </h2>
      <p className="text-xs text-gray-400">
        Opt in to have your author site featured as a real example on the AuthorLoft homepage, inspiring potential new authors.
      </p>

      {/* Opt-in toggle */}
      <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {enabled ? "Featured in showcase" : "Not in showcase"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {enabled
              ? "Your site is visible to visitors on the AuthorLoft homepage."
              : "Opt in to help inspire new authors by showcasing your site."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!!enabled}
          disabled={saving || enabled === null}
          onClick={() => patch({ showInShowcase: !enabled })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          {saving
            ? <Loader2 className="h-3 w-3 animate-spin text-white absolute left-1/2 -translate-x-1/2" />
            : <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          }
        </button>
      </div>

      {/* Display style — only shown when opted in */}
      {enabled && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Display style</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SHOWCASE_STYLES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={saving}
                onClick={() => { if (style !== opt.value) patch({ showcaseStyle: opt.value }); }}
                className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm disabled:opacity-50 ${
                  style === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <p className={`font-semibold text-sm ${style === opt.value ? "text-blue-700" : "text-gray-800"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BadgesToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving,  setSaving]  = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch("/api/admin/settings/badges")
      .then((r) => r.json())
      .then((d) => setEnabled(d.showBadges ?? true))
      .catch(() => { setEnabled(true); });
  }, []);

  async function patch(showBadges: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/badges", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ showBadges }),
      });
      if (res.ok) {
        setEnabled(showBadges);
        toast("success", showBadges
          ? "Your achievement badges will now show publicly."
          : "Your achievement badges are now hidden.");
      } else {
        toast("error", "Could not update badge setting.");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Award className="h-4 w-4 text-gray-400" />
        Achievement Badges
      </h2>
      <p className="text-xs text-gray-400">
        Badges are earned automatically from your activity — books published, direct sales,
        reviews, and more. They can appear on your Bookstore listing and author site.
      </p>

      <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {enabled ? "Badges visible" : "Badges hidden"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {enabled
              ? "Any badges you've earned are shown publicly."
              : "Your earned badges are hidden from public pages."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!!enabled}
          disabled={saving || enabled === null}
          onClick={() => patch(!enabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          {saving
            ? <Loader2 className="h-3 w-3 animate-spin text-white absolute left-1/2 -translate-x-1/2" />
            : <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          }
        </button>
      </div>
    </section>
  );
}

// ── Account tab content ───────────────────────────────────────────────────────

function AccountTab() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function validateForm(): string | null {
    if (!currentPassword) return "Please enter your current password.";
    if (!newPassword) return "Please enter a new password.";
    if (newPassword.length < 8)             return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(newPassword))         return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(newPassword))         return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(newPassword))  return "Password must contain at least one special character (!@#$… etc).";
    if (newPassword !== confirmPassword) return "New passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return; }
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          Account Info
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
            <p className="text-xs text-gray-400">To change your email, please contact support.</p>
          </div>
        </div>
      </section>

      {/* Marketing showcase opt-in */}
      <ShowcaseToggle />

      {/* Achievement badges opt-in */}
      <BadgesToggle />

      {/* Change password */}
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
            <Button variant="outline" className="mt-2" onClick={() => setSuccess(false)}>Change Again</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Current Password" type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password" autoComplete="current-password" required />
            <div className="space-y-1.5">
              <Input label="New Password" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Uppercase, number, special char" autoComplete="new-password" required />
              {newPassword && (
                <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {[
                    { label: "8+ characters",    met: newPassword.length >= 8 },
                    { label: "Uppercase letter",  met: /[A-Z]/.test(newPassword) },
                    { label: "Number",            met: /[0-9]/.test(newPassword) },
                    { label: "Special character", met: /[^A-Za-z0-9]/.test(newPassword) },
                  ].map(({ label, met }) => (
                    <li key={label} className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`inline-block w-3 h-3 flex-shrink-0 ${met ? "text-green-600" : "text-gray-300"}`}>✓</span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1">
              <Input label="Confirm New Password" type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error === "New passwords do not match.") setError(""); }}
                placeholder="Repeat your new password" autoComplete="new-password" required />
              {confirmPassword.length > 0 && (
                <p className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            )}
            <div className="pt-1">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as SettingsTab | null;
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (window.location.hash === "#billing") {
      setActiveTab("billing");
    }
  }, []);

  return (
    <div className="space-y-0 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      {/* ── Tab bar ── */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${id === "danger" ? (activeTab === "danger" ? "text-red-600 border-red-500" : "text-red-400 hover:text-red-600 hover:border-red-300") : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab panels ── */}
      {activeTab === "account" && <AccountTab />}

      {activeTab === "billing" && (
        <div className="space-y-6">
          <SubscriptionSection />
          <StripeConnectSection />
        </div>
      )}

      {activeTab === "integrations" && <AiKeySection />}

      {activeTab === "appearance" && <AdminThemeSection />}

      {activeTab === "communications" && <EmailPreferencesSection />}

      {activeTab === "danger" && (
        <section className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your AuthorLoft account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={() => alert("To delete your account, please contact support@authorloft.com")}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />Delete Account
          </Button>
        </section>
      )}
    </div>
  );
}
