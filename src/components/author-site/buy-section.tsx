"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { DiscountCodeInput, type AppliedDiscount } from "@/components/author-site/discount-code-input";

interface BuySectionProps {
  saleItemId:     string;
  basePriceCents: number;
  accentColor:    string;
}

export function BuySection({ saleItemId, basePriceCents, accentColor }: BuySectionProps) {
  const csrfToken = useCSRFToken();
  const [loading,      setLoading]      = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);

  async function handleCheckout() {
    setCheckoutError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
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
      <DiscountCodeInput
        target={{ saleItemIds: [saleItemId] }}
        accentColor={accentColor}
        onApplied={setApplied}
      />

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
