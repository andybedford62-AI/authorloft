"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface Step {
  done: boolean;
  label: string;
  hint?: string | null;
  href: string | null;
}

export function NextStepsCard({
  steps,
  subtitle = "Optional — set these up to enable direct book sales",
}: {
  steps: Step[];
  subtitle?: string;
}) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    await fetch("/api/admin/author/dismiss-next-steps", { method: "PATCH" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Next Steps</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Don't show again"
        >
          <X className="h-3.5 w-3.5" />
          Don&apos;t show again
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {steps.map((step) => (
          <div key={step.label} className="flex items-start gap-3 px-5 py-3.5">
            <div
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${step.done ? "bg-green-500 border-green-500" : "border-gray-200 bg-white"}`}
            >
              {step.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {step.label}
              </p>
              {!step.done && step.hint && (
                <p className="text-xs text-gray-400 mt-0.5">{step.hint}</p>
              )}
            </div>
            {!step.done && step.href && (
              <Link
                href={step.href}
                className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
              >
                Go <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-gray-100">
        <Link
          href="/admin/getting-started"
          className="text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          View the full setup checklist →
        </Link>
      </div>
    </div>
  );
}
