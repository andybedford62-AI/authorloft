"use client";

import { useState } from "react";

export function ResendButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleResend() {
    setState("loading");
    try {
      const res = await fetch("/api/orders/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center space-y-1">
        <p className="text-sm font-medium text-green-800">Check your inbox!</p>
        <p className="text-xs text-green-600">A new download link has been sent to your email.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">Something went wrong. Please try again or contact support.</p>
        </div>
        <button onClick={() => setState("idle")} className="text-sm text-blue-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleResend}
      disabled={state === "loading"}
      className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
    >
      {state === "loading" ? "Sending…" : "Resend my download link"}
    </button>
  );
}
