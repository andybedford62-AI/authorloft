"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authPageStyle, authCardStyle, AUTH_LINK, AUTH_BRASS } from "@/app/(auth)/auth-theme";

export default function AcceptTermsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("You must check the box to accept the Terms of Service and Privacy Policy.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/accept-terms", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={authPageStyle}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="p-8 space-y-6" style={authCardStyle}>
          <div>
            <h1 className="text-xl font-bold text-gray-900">One last step</h1>
            <p className="text-sm text-gray-500 mt-1">
              Before you access your account, please read and accept our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Summary boxes */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="rounded-md px-4 py-3 space-y-1" style={{ backgroundColor: "#FBF7EE", border: "1px solid #EADFC6" }}>
              <p className="font-semibold text-blue-800">What you&apos;re agreeing to</p>
              <ul className="list-disc list-inside text-blue-700 text-xs space-y-0.5">
                <li>AuthorLoft may be used only for lawful author-related purposes</li>
                <li>You are responsible for the content you publish on your site</li>
                <li>We collect and store data as described in our Privacy Policy</li>
                <li>You must be at least 18 years of age to create an account</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Read the full{" "}
              <Link href="/terms" target="_blank" className="hover:underline" style={{ color: AUTH_LINK }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" target="_blank" className="hover:underline" style={{ color: AUTH_LINK }}>Privacy Policy</Link>
              {" "}before accepting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Checkbox */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                id="terms"
                type="checkbox"
                checked={accepted}
                onChange={(e) => { setAccepted(e.target.checked); setError(""); }}
                className="h-4 w-4 mt-0.5 flex-shrink-0 rounded border-gray-300 cursor-pointer" style={{ accentColor: AUTH_BRASS }}
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
                . I confirm I am at least 18 years of age.
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!accepted || submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : "Accept & Continue to Dashboard"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            If you do not agree, you can{" "}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 hover:underline"
            >
              sign out
            </button>
            {" "}— no account data will be retained.
          </p>
        </div>
      </div>
    </div>
  );
}
