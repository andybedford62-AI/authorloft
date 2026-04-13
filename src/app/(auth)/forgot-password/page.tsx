"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {sent ? (
            /* ── Success state ──────────────────────────────────────── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-50 rounded-full p-4">
                  <MailCheck className="h-8 w-8 text-blue-600" />
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
                  className="text-blue-600 hover:underline"
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  style={{ "--accent": "#2563EB" } as React.CSSProperties}
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
          <Link href="/login" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
