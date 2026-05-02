"use client";

import { useState } from "react";
import Link from "next/link";
import { XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailInvalidPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          {sent ? (
            <>
              <div className="flex justify-center">
                <div className="bg-green-50 rounded-full p-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  If that email has a pending account, a new verification link is on its way. Check your spam folder if it doesn&apos;t arrive within a few minutes.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="bg-red-50 rounded-full p-4">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Link expired or invalid</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  This verification link has expired or has already been used. Verification links are valid for 24 hours.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-3 text-left">
                <Input
                  type="email"
                  placeholder="Enter your email to resend"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send new verification link"}
                </Button>
              </form>
            </>
          )}

          <p className="text-xs text-gray-400">
            Already verified?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
