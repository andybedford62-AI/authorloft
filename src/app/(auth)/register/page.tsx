"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  BookOpen, Loader2, Check, X, ArrowRight, ArrowLeft, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

// ── Slug availability indicator ───────────────────────────────────────────────

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function useSlugCheck(slug: string): SlugStatus {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slug) { setStatus("idle"); return; }
    if (slug.length < 3) { setStatus("invalid"); return; }
    if (slug.length > 40) { setStatus("invalid"); return; }

    setStatus("checking");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.reason) {
          setStatus("invalid");
        } else {
          setStatus(data.available ? "available" : "taken");
        }
      } catch {
        setStatus("idle");
      }
    }, 400);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slug]);

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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);

  // Step 2 fields
  const [slug,       setSlug]       = useState("");
  const [slugEdited, setSlugEdited] = useState(false); // user manually changed slug

  // Auto-generate slug from name (unless user has edited it manually)
  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(slugify(name));
    }
  }, [name, slugEdited]);

  const slugStatus = useSlugCheck(slug);
  const strength   = passwordStrength(password);

  // Form state
  const [step1Error, setStep1Error] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Step 1 validation ───────────────────────────────────────────────────
  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error("");
    if (!name.trim()) return setStep1Error("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setStep1Error("Please enter a valid email address.");
    if (password.length < 8)
      return setStep1Error("Password must be at least 8 characters.");
    if (password !== confirmPassword)
      return setStep1Error("Passwords don't match.");
    setStep(2);
  }

  // ── Final submit ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep2Error("");

    if (slugStatus === "taken")   return setStep2Error("That URL is already taken. Please choose another.");
    if (slugStatus === "invalid") return setStep2Error("Site URL must be 3–40 characters, letters, numbers, and hyphens only.");
    if (slugStatus === "checking") return setStep2Error("Still checking availability — please wait a moment.");

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password, slug }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.field === "email") { setStep(1); setStep1Error(data.error); }
        else setStep2Error(data.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Unlikely — just send to login with success message
        router.push("/login?registered=1");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setStep2Error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const slugIndicator = () => {
    if (!slug) return null;
    if (slugStatus === "checking") return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    if (slugStatus === "available") return <Check className="h-4 w-4 text-green-500" />;
    if (slugStatus === "taken")    return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const previewDomain =
    process.env.NODE_ENV === "development"
      ? `${slug || "yourname"}.localhost:3000`
      : `${slug || "yourname"}.${PLATFORM_DOMAIN}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            Create your free author website
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-gray-700" : "text-gray-400"}`}>
                {s === 1 ? "Your account" : "Your site URL"}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* ── STEP 1: Account ────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
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
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                {/* Strength meter */}
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

              {step1Error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {step1Error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                style={{ "--accent": "#2563EB" } as React.CSSProperties}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {/* ── STEP 2: Site URL ────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Choose your site URL</h2>
                <p className="text-sm text-gray-500 mt-1">
                  This is the address readers will use to find your author website. You can connect a custom domain later.
                </p>
              </div>

              {/* URL field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Site URL
                </label>
                <div className="flex items-center rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugEdited(true);
                    }}
                    placeholder="yourname"
                    maxLength={40}
                    className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                    autoFocus
                  />
                  <span className="px-3 py-2 bg-gray-50 border-l border-gray-200 text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
                    .{PLATFORM_DOMAIN}
                  </span>
                </div>

                {/* Availability feedback */}
                <div className="flex items-center gap-1.5 h-5">
                  {slugIndicator()}
                  {slug && (
                    <span className={`text-xs font-medium ${
                      slugStatus === "available" ? "text-green-600" :
                      slugStatus === "taken"     ? "text-red-600"   :
                      slugStatus === "invalid"   ? "text-amber-600" :
                      "text-gray-400"
                    }`}>
                      {slugStatus === "available" && "Available!"}
                      {slugStatus === "taken"     && "Already taken"}
                      {slugStatus === "invalid"   && "3–40 characters, letters, numbers, hyphens"}
                      {slugStatus === "checking"  && "Checking…"}
                    </span>
                  )}
                </div>
              </div>

              {/* Live preview */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Preview
                </p>
                <p className="font-mono text-sm text-blue-600 break-all">
                  {process.env.NODE_ENV === "development" ? "http" : "https"}://{previewDomain}
                </p>
                <p className="text-xs text-gray-400">
                  Your readers will visit this URL to find your books, bio, and more.
                </p>
              </div>

              {step2Error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {step2Error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setStep2Error(""); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  style={{ "--accent": "#2563EB" } as React.CSSProperties}
                  disabled={
                    submitting ||
                    !slug ||
                    slugStatus === "taken" ||
                    slugStatus === "invalid" ||
                    slugStatus === "checking"
                  }
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account…</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" />Create my account</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
