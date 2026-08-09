"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCSRFToken } from "@/hooks/use-csrf-token";

interface BundleBuyButtonProps {
  bundleId: string;
  priceCents: number;
  accentColor: string;
}

export function BundleBuyButton({ bundleId, priceCents, accentColor }: BundleBuyButtonProps) {
  const csrfToken = useCSRFToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        body: JSON.stringify({ bundleId }),
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

  return (
    <div>
      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full text-base py-6"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5 mr-2" />
        )}
        Buy Bundle — ${(priceCents / 100).toFixed(2)}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
