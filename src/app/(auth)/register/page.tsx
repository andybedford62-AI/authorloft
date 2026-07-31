"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Loader2, Check, ArrowRight, ArrowLeft, Eye, EyeOff, KeyRound, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitize } from "@/lib/sanitize";
import { RequestAccessModal } from "@/components/auth/RequestAccessModal";
import { authPageStyle, authCardStyle, authPrimaryStyle, authNoticeStyle, AUTH_LINK, AUTH_BRASS, AUTH_INK } from "../auth-theme";

// ── Beta status ───────────────────────────────────────────────────────────────

type BetaStatus = { betaMode: boolean; betaMessage: string } | null;

function useBetaStatus(): BetaStatus {
  const [status, setStatus] = useState<BetaStatus>(null);
  useEffect(() => {
    fetch("/api/auth/beta-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ betaMode: false, betaMessage: "" }));
  }, []);
  return status;
}

// ── Password strength meter ───────────────────────────────────────────────────

function passwordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (p.length >= 8)  score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-400" };
  if (score <= 2) return { score, label: "Fair",   color: "bg-amber-400" };
  if (score <= 3) return { score, label: "Good",   color: "bg-blue-400" };
  return             { score, label: "Strong", color: "bg-green-500" };
}

// ── Main component ────────────────────────────────────────────────────────────

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const betaStatus   = useBetaStatus();

  // betaStatus null = still loading; defer rendering until known
  const betaMode    = betaStatus?.betaMode ?? false;
  const betaMessage = betaStatus?.betaMessage ?? "";

  // Intended plan from marketing page (?plan=standard or ?plan=premium)
  const intendedPlan = searchParams.get("plan")?.toLowerCase() ?? null;
  const intendedPlanLabel = intendedPlan === "premium" ? "Premium" : intendedPlan === "standard" ? "Standard" : null;

  // Step 0 = invite code (beta only); Step 1 = account. The site URL used to be
  // a second step — it's now derived from the name at signup and changed later
  // in Settings, so nothing stands between a curious visitor and an account.
  const [step, setStep] = useState<0 | 1>(1);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Step 0 fields
  const [inviteCode,      setInviteCode]      = useState("");
  const [inviteError,     setInviteError]     = useState(
    searchParams.get("google_beta_blocked") === "1"
      ? "Google sign-up is not available during beta. Please use your invite code below."
      : ""
  );

  // Step 1 fields
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [termsAccepted,   setTermsAccepted]   = useState(false);

  // Once we know beta mode is on, start at step 0
  useEffect(() => {
    if (betaStatus !== null) {
      setStep(betaStatus.betaMode ? 0 : 1);
    }
  }, [betaStatus]);

  const strength = passwordStrength(password);

  const [step1Error, setStep1Error] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Beta mode is off far more often than on, so the initial render assumes
  // step 1 (the real form, with its links) rather than blocking on the
  // fetch — crawlers and slow-JS users get real content immediately instead
  // of an empty loading shell. The effect above flips to step 0 if beta
  // turns out to be on.

  // ── Step 0: invite code ─────────────────────────────────────────────────
  function handleInviteCode(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    if (!inviteCode.trim()) return setInviteError("Please enter your invite code.");
    setStep(1);
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error("");

    if (!name.trim()) return setStep1Error("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setStep1Error("Please enter a valid email address.");
    if (password.length < 8)            return setStep1Error("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password))        return setStep1Error("Password must contain at least one uppercase letter.");
    if (!/[0-9]/.test(password))        return setStep1Error("Password must contain at least one number.");
    if (!/[^A-Za-z0-9]/.test(password)) return setStep1Error("Password must contain at least one special character (!@#$… etc).");
    if (password !== confirmPassword)   return setStep1Error("Passwords don't match.");
    if (!termsAccepted)                 return setStep1Error("You must accept the Terms of Service and Privacy Policy to create an account.");

    setSubmitting(true);

    try {
      // No slug sent — the API derives one from the name; people set the URL
      // they actually want in Settings once they're in.
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          termsAccepted,
          ...(betaMode && { inviteCode: inviteCode.trim().toUpperCase() }),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.field === "inviteCode") { setStep(0); setInviteError(data.error); }
        else setStep1Error(data.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setRegistered(true);
      if (intendedPlan) {
        localStorage.setItem("intendedPlan", intendedPlan);
      }

      // Fire Google Ads signup conversion
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "conversion", { send_to: "AW-18031958972/bEq6CJbgg6QcELy3p5ZD" });
      }
    } catch {
      setStep1Error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  // Only beta mode has more than one step, so the indicator is hidden otherwise.
  const stepLabels = ["Invite code", "Your account"];
  const totalSteps = stepLabels.length;
  const visualStep = step;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={authPageStyle}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            Start your author career — free
          </p>
        </div>

        {/* ── Success: email verification prompt ── */}
        {registered ? (
          <div className="p-8 text-center space-y-4" style={authCardStyle}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto" style={{ backgroundColor: "#FBF3E4" }}>
              <svg className="h-7 w-7" style={{ color: AUTH_BRASS }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Check your inbox!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We sent a verification email to{" "}
              <span className="font-medium text-gray-900">{email.toLowerCase().trim()}</span>.
              <br />
              Click the link in the email to activate your account.
            </p>
            <div className="px-4 py-3 text-sm text-left space-y-1" style={authNoticeStyle}>
              <p className="font-medium">Before you can sign in:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>Verify your email by clicking the link we just sent</li>
                <li>Sign in to your new account</li>
                {intendedPlanLabel && (
                  <li>Go to <span className="font-medium">Settings → Billing</span> to upgrade to {intendedPlanLabel}</li>
                )}
              </ol>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full mt-2 px-4 py-2.5 text-sm font-medium rounded-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: AUTH_BRASS, color: AUTH_INK }}
            >
              Go to Sign In
            </Link>
            <p className="text-xs text-gray-400">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <Link href="/verify-email/invalid" className="hover:underline" style={{ color: AUTH_LINK }}>
                resend the email
              </Link>
              .
            </p>
          </div>
        ) : (
        <>

        {/* Step indicator — beta mode only; the normal flow is a single step */}
        {betaMode && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  visualStep >= idx ? "" : "bg-gray-200 text-gray-400"
                }`}
                style={visualStep >= idx ? { backgroundColor: AUTH_BRASS, color: AUTH_INK } : undefined}
              >
                {visualStep > idx ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium ${visualStep >= idx ? "text-gray-700" : "text-gray-400"}`}>
                {label}
              </span>
              {idx < totalSteps - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>
        )}

        <div className="p-8" style={authCardStyle}>

          {/* ── STEP 0: Invite code (beta only) ────────────────────────── */}
          {step === 0 && (
            <form onSubmit={handleInviteCode} className="space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <KeyRound className="h-5 w-5" style={{ color: AUTH_BRASS }} />
                  Enter your invite code
                </h2>
                {betaMessage ? (
                  <div
                    className="rich-content mt-1"
                    dangerouslySetInnerHTML={{ __html: sanitize(betaMessage) }}
                  />
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    AuthorLoft is currently in private beta. You need an invite code to create an account.
                  </p>
                )}
              </div>

              <Input
                label="Invite Code"
                name="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="LOFT-XXXX"
                autoComplete="off"
                autoFocus
              />

              {inviteError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {inviteError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                style={authPrimaryStyle}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <p className="text-center text-xs text-gray-400">
                Don&apos;t have an invite code?{" "}
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="hover:underline" style={{ color: AUTH_LINK }}
                >
                  Request access
                </button>
              </p>
            </form>
          )}

          {/* ── STEP 1: Account ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Google sign-up — hidden in beta mode */}
              {!betaMode && (
                <>
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="A.P. Bedford"
                  autoComplete="name"
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 chars, uppercase, number, symbol"
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              strength.score >= i ? strength.color : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        Password strength: <span className="font-medium text-gray-600">{strength.label}</span>
                      </p>
                    </div>
                  )}
                  {password && (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
                      {[
                        { label: "8+ characters",    met: password.length >= 8 },
                        { label: "Uppercase letter",  met: /[A-Z]/.test(password) },
                        { label: "Number",            met: /[0-9]/.test(password) },
                        { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
                      ].map(({ label, met }) => (
                        <li key={label} className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
                          <Check className={`h-3 w-3 flex-shrink-0 ${met ? "opacity-100" : "opacity-30"}`} />
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  hint={
                    confirmPassword && confirmPassword !== password
                      ? "Passwords don't match"
                      : undefined
                  }
                />

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => { setTermsAccepted(e.target.checked); setStep1Error(""); }}
                    className="h-4 w-4 mt-0.5 flex-shrink-0 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: AUTH_BRASS }}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
                    I have read and agree to the{" "}
                    <Link href="/terms" target="_blank" className="hover:underline font-medium" style={{ color: AUTH_LINK }}>
                      Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="hover:underline font-medium" style={{ color: AUTH_LINK }}>
                      Privacy Policy
                    </Link>
                    . By creating an account I confirm I am at least 18 years of age.
                  </label>
                </div>

                {step1Error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {step1Error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || !termsAccepted}
                  className="w-full mt-2"
                  style={authPrimaryStyle}
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account…</>
                  ) : (
                    <>Create my account<ArrowRight className="h-4 w-4 ml-2" /></>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  You&apos;ll pick your site address once you&apos;re in — it&apos;s easy to change later.
                </p>
              </form>

              {betaMode && (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to invite code
                </button>
              )}
            </div>
          )}

        </div>

        {!registered && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="hover:underline font-medium" style={{ color: AUTH_LINK }}>
              Sign in
            </Link>
          </p>
        )}
        </>
        )}
      </div>

      <RequestAccessModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={authPageStyle}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  );
}
