"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authPageStyle, authCardStyle, authPrimaryStyle, AUTH_LINK, AUTH_BRASS } from "@/app/(auth)/auth-theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={authPageStyle}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="p-8" style={authCardStyle}>

          {sent ? (
            /* ── Success state ──────────────────────────────────────── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full p-4" style={{ backgroundColor: "#FBF3E4" }}>
                  <MailCheck className="h-8 w-8" style={{ color: AUTH_BRASS }} />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                If an account exists for <strong className="text-gray-700">{email}</strong>,
                we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-gray-400">
                Don't see it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="hover:underline" style={{ color: AUTH_LINK }}
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* ── Form ───────────────────────────────────────────────── */
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                />

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  size="lg"
                  className="w-full"
                  style={authPrimaryStyle}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 hover:underline font-medium" style={{ color: AUTH_LINK }}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
