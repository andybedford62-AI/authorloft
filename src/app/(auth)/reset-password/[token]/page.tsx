"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TokenState = "checking" | "valid" | "invalid";

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

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrength(password);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setTokenState("invalid"); return; }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => setTokenState(data.valid ? "valid" : "invalid"))
      .catch(() => setTokenState("invalid"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setDone(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
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

          {/* ── Checking token ─────────────────────────────────────────── */}
          {tokenState === "checking" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Verifying your reset link…</p>
            </div>
          )}

          {/* ── Invalid token ──────────────────────────────────────────── */}
          {tokenState === "invalid" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Link expired or invalid</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                This password reset link has expired or has already been used. Reset links are valid for 1 hour.
              </p>
              <Link href="/forgot-password">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                  style={{ "--accent": "#2563EB" } as React.CSSProperties}
                >
                  Request a new reset link
                </Button>
              </Link>
            </div>
          )}

          {/* ── Success ────────────────────────────────────────────────── */}
          {done && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Password updated!</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your password has been changed successfully. Redirecting you to sign in…
              </p>
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Sign in now
              </Link>
            </div>
          )}

          {/* ── Form ───────────────────────────────────────────────────── */}
          {tokenState === "valid" && !done && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Choose a new password</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Make it strong — at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                      autoFocus
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        Strength: <span className="font-medium text-gray-600">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                />

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  style={{ "--accent": "#2563EB" } as React.CSSProperties}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…</>
                  ) : (
                    "Set new password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
