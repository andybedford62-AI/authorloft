"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Tag, Check, X } from "lucide-react";
import { formatCents } from "@/lib/utils";

interface BuySectionProps {
  saleItemId:     string;
  basePriceCents: number;
  accentColor:    string;
}

export function BuySection({ saleItemId, basePriceCents, accentColor }: BuySectionProps) {
  const [loading,      setLoading]      = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Discount state
  const [codeInput,     setCodeInput]     = useState("");
  const [validating,    setValidating]    = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [applied,       setApplied]       = useState<{
    code: string;
    discountCents: number;
    finalPriceCents: number;
    label: string;
  } | null>(null);

  async function applyCode() {
    const code = codeInput.trim();
    if (!code) return;
    setDiscountError("");
    setValidating(true);
    try {
      const res  = await fetch("/api/checkout/validate-discount", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code, saleItemId }),
      });
      const data = await res.json();
      if (!data.valid) {
        setDiscountError(data.error || "Invalid code.");
        setApplied(null);
        return;
      }
      setApplied({
        code,
        discountCents:   data.discountCents,
        finalPriceCents: data.finalPriceCents,
        label:
          data.type === "PERCENT"
            ? `${data.value}% off`
            : `${formatCents(data.discountCents)} off`,
      });
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
  }

  async function handleCheckout() {
    setCheckoutError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          saleItemId,
          ...(applied && { discountCode: applied.code }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const finalPrice    = applied ? applied.finalPriceCents : basePriceCents;
  const hasDiscount   = applied !== null;

  return (
    <div className="space-y-4">
      {/* Discount code row */}
      {!applied ? (
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
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
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
          {discountError && (
            <p className="text-xs text-red-600">{discountError}</p>
          )}
        </div>
      ) : (
        /* Applied discount badge */
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
      )}

      {/* Price summary if discount applied */}
      {hasDiscount && (
        <div className="space-y-1 py-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Original price</span>
            <span className="line-through">{formatCents(basePriceCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Discount ({applied!.label})</span>
            <span>−{formatCents(applied!.discountCents)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>{formatCents(finalPrice)}</span>
          </div>
        </div>
      )}

      {/* Checkout button */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        style={{ backgroundColor: accentColor }}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout…</>
        ) : (
          <><ShoppingCart className="h-4 w-4" /> Pay {formatCents(finalPrice)}</>
        )}
      </button>

      {checkoutError && (
        <p className="text-sm text-red-600 text-center">{checkoutError}</p>
      )}
    </div>
  );
}
