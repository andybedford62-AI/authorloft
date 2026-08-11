"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { useCSRFToken } from "@/hooks/use-csrf-token";

export type AppliedDiscount = {
  code: string;
  discountCents: number;
  finalPriceCents: number;
  label: string;
};

type DiscountTarget =
  | { saleItemIds: string[] }
  | { bundleId: string }
  | { courseId: string };

interface DiscountCodeInputProps {
  target: DiscountTarget;
  accentColor?: string;
  /** Change this value to clear any applied code (e.g. when cart contents change). */
  resetSignal?: string | number;
  onApplied: (result: AppliedDiscount | null) => void;
}

export function DiscountCodeInput({ target, accentColor, resetSignal, onApplied }: DiscountCodeInputProps) {
  const csrfToken = useCSRFToken();
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setApplied(null);
    setCodeInput("");
    setDiscountError("");
    onApplied(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  async function applyCode() {
    const code = codeInput.trim();
    if (!code) return;
    setDiscountError("");
    setValidating(true);
    try {
      const res = await fetch("/api/checkout/validate-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        body: JSON.stringify({ code, ...target }),
      });
      const data = await res.json();
      if (!data.valid) {
        setDiscountError(data.error || "Invalid code.");
        setApplied(null);
        onApplied(null);
        return;
      }
      const result: AppliedDiscount = {
        code,
        discountCents: data.discountCents,
        finalPriceCents: data.finalPriceCents ?? data.finalTotal,
        label:
          data.type === "PERCENT"
            ? `${data.value}% off`
            : `${formatCents(data.discountCents)} off`,
      };
      setApplied(result);
      onApplied(result);
    } catch {
      setDiscountError("Could not validate code. Try again.");
    } finally {
      setValidating(false);
    }
  }

  function removeCode() {
    setApplied(null);
    setCodeInput("");
    setDiscountError("");
    onApplied(null);
  }

  const ringStyle = accentColor ? ({ "--tw-ring-color": accentColor } as React.CSSProperties) : undefined;

  if (applied) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-green-200 bg-green-50">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-mono font-semibold text-green-800">{applied.code}</span>
          <span className="text-sm text-green-700">— {applied.label}</span>
        </div>
        <button onClick={removeCode} className="text-green-600 hover:text-green-800 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">Discount code</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={codeInput}
          onChange={(e) => {
            setCodeInput(e.target.value.toUpperCase());
            setDiscountError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && applyCode()}
          placeholder="Enter code"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-offset-0"
          style={ringStyle}
        />
        <button
          type="button"
          onClick={applyCode}
          disabled={validating || !codeInput.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {discountError && <p className="text-xs text-red-600">{discountError}</p>}
    </div>
  );
}
