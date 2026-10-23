"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { DiscountCodeInput, type AppliedDiscount } from "@/components/author-site/discount-code-input";
import { ShippingPicker, NO_SHIPPING, type ShippingSelection } from "@/components/author-site/shipping-picker";

interface BundleBuyButtonProps {
  bundleId: string;
  priceCents: number;
  accentColor: string;
}

export function BundleBuyButton({ bundleId, priceCents, accentColor }: BundleBuyButtonProps) {
  const csrfToken = useCSRFToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);
  const [shipping, setShipping] = useState<ShippingSelection>(NO_SHIPPING);

  async function handleBuy() {
    if (!shipping.ready) {
      setError("Choose a delivery country first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        body: JSON.stringify({
          bundleId,
          ...(applied && { discountCode: applied.code }),
          ...(shipping.hasPrint && { shippingCountry: shipping.country }),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const shippingCents = shipping.hasPrint ? shipping.amountCents ?? 0 : 0;
  const finalPriceCents = (applied ? applied.finalPriceCents : priceCents) + shippingCents;

  return (
    <div className="space-y-3">
      <DiscountCodeInput
        target={{ bundleId }}
        accentColor={accentColor}
        onApplied={setApplied}
      />
      <ShippingPicker bundleId={bundleId} onChange={setShipping} />
      <Button
        onClick={handleBuy}
        disabled={loading || !shipping.ready}
        className="w-full text-base py-6"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5 mr-2" />
        )}
        Buy Bundle — ${(finalPriceCents / 100).toFixed(2)}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
