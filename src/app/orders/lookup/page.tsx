"use client";

import { useState } from "react";
import Link from "next/link";

export default function OrderLookupPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      await fetch("/api/orders/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // Always show success — never leak whether the email exists
    }
    setState("done");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">

        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-2xl">
          📦
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Find my purchase</h1>
          <p className="text-sm text-gray-500">
            Enter the email address you used to purchase and we'll resend your download link.
          </p>
        </div>

        {state === "done" ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-5 space-y-2">
            <p className="text-sm font-medium text-green-800">Check your inbox!</p>
            <p className="text-xs text-green-600">
              If we found any purchases for that email, we've sent the download link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={state === "loading" || !email.trim()}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {state === "loading" ? "Looking up…" : "Send my download link"}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to AuthorLoft
          </Link>
        </p>
      </div>
    </div>
  );
}
