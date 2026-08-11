"use client";

import { CheckCircle2 } from "lucide-react";

interface WizardStepsProps {
  steps: { id: string; label: string }[];
  currentIndex: number;
  className?: string;
}

export function WizardSteps({ steps, currentIndex, className = "" }: WizardStepsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i < currentIndex ? "bg-emerald-100 text-emerald-700"
              : i === currentIndex ? "bg-[var(--accent)] text-white"
              : "bg-gray-100 text-gray-400"
            }`}
          >
            {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-sm ${i === currentIndex ? "font-semibold text-gray-900" : "text-gray-400"}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="h-px w-8 bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}
