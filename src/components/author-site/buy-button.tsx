"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BuyButtonProps {
  saleItemId: string;
  label: string;
  accentColor: string;
}

export function BuyButton({ saleItemId, label, accentColor }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleItemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe hosted checkout page
      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{ backgroundColor: accentColor }}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout…</>
        ) : (
          <><ShoppingCart className="h-4 w-4" /> {label}</>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
