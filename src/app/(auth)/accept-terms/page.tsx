"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">One last step</h1>
            <p className="text-sm text-gray-500 mt-1">
              Before you access your account, please read and accept our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Summary boxes */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 space-y-1">
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
              <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>
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
                className="h-4 w-4 mt-0.5 flex-shrink-0 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : "Accept & Continue to Dashboard"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            If you do not agree, you can{" "}
            <Link href="/api/auth/signout" className="text-red-500 hover:underline">
              sign out
            </Link>
            {" "}— no account data will be retained.
          </p>
        </div>
      </div>
    </div>
  );
}
