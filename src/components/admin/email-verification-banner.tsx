"use client";

import { useState } from "react";
import { MailWarning, X, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  email: string;
}

export function EmailVerificationBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (dismissed) return null;

  async function handleResend() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
      <MailWarning className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {sent ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Verification email sent to <span className="font-semibold">{email}</span>. Check your inbox!
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Please verify your email address.</span>{" "}
              We sent a verification link to <span className="font-medium">{email}</span>.
            </p>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
            <button
              onClick={handleResend}
              disabled={sending}
              className="mt-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 disabled:opacity-60 flex items-center gap-1"
            >
              {sending && <Loader2 className="h-3 w-3 animate-spin" />}
              {sending ? "Sending…" : "Resend verification email"}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
