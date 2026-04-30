"use client";

import { useEffect, useState } from "react";
import { X, Trash2, ShoppingCart, Loader2, Tag, Headphones, Tablet, BookOpen, Music } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCents } from "@/lib/utils";
import Image from "next/image";

// ── Format icon helper ────────────────────────────────────────────────────────

function FormatIcon({ format }: { format: string }) {
  switch (format) {
    case "AUDIO":    return <Headphones className="h-3.5 w-3.5" />;
    case "FLIPBOOK": return <Music className="h-3.5 w-3.5" />;
    case "PRINT":    return <BookOpen className="h-3.5 w-3.5" />;
    default:         return <Tablet className="h-3.5 w-3.5" />;
  }
}

const FORMAT_COLORS: Record<string, { color: string; bg: string }> = {
  EBOOK:    { color: "#2563eb", bg: "#eff6ff" },
  AUDIO:    { color: "#d97706", bg: "#fffbeb" },
  FLIPBOOK: { color: "#7c3aed", bg: "#f5f3ff" },
  PRINT:    { color: "#059669", bg: "#ecfdf5" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const {
    items,
    removeItem,
    clearCart,
    itemCount,
    totalCents,
    isOpen,
    closeCart,
  } = useCart();

  const [loading,       setLoading]       = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Discount state
  const [codeInput,     setCodeInput]     = useState("");
  const [validating,    setValidating]    = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [applied, setApplied] = useState<{
    code:           string;
    discountCents:  number;
    label:          string;
  } | null>(null);

  // Reset discount when items change
  useEffect(() => {
    setApplied(null);
    setDiscountError("");
    setCodeInput("");
  }, [items.length]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  async function applyCode() {
    const code = codeInput.trim();
    if (!code || items.length === 0) return;
    setDiscountError("");
    setValidating(true);
    try {
      const res = await fetch("/api/checkout/validate-discount", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code, saleItemIds: items.map((i) => i.saleItemId) }),
      });
      const data = await res.json();
      if (!data.valid) {
        setDiscountError(data.error || "Invalid code.");
        setApplied(null);
        return;
      }
      setApplied({
        code,
        discountCents: data.discountCents,
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
    if (items.length === 0) return;
    setCheckoutError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          items: items.map((i) => ({ saleItemId: i.saleItemId })),
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

  const finalTotal = Math.max(0, totalCents - (applied?.discountCents ?? 0));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            <h2 className="font-semibold text-gray-900">
              Cart {itemCount > 0 && <span className="text-gray-400 font-normal text-sm">({itemCount})</span>}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-16">
              <ShoppingCart className="h-10 w-10 text-gray-200" />
              <p className="text-gray-500 text-sm">Your cart is empty.</p>
              <p className="text-gray-400 text-xs">Add books from any book page.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const fmt = FORMAT_COLORS[item.format] ?? FORMAT_COLORS.EBOOK;
                return (
                  <li key={item.saleItemId} className="flex gap-3 px-5 py-4">
                    {/* Cover */}
                    <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl}
                          alt={item.bookTitle}
                          width={48}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.bookTitle}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium border"
                          style={{ color: fmt.color, backgroundColor: fmt.bg, borderColor: `${fmt.color}30` }}
                        >
                          <FormatIcon format={item.format} />
                          {item.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1.5">
                        {formatCents(item.priceCents)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.saleItemId)}
                      className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 transition-colors self-start mt-0.5"
                      aria-label={`Remove ${item.bookTitle} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — discount + checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4">

            {/* Discount code */}
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
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-0"
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
            ) : (
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

            {/* Price summary */}
            <div className="space-y-1.5">
              {applied && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="line-through">{formatCents(totalCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount ({applied.label})</span>
                    <span>−{formatCents(applied.discountCents)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCents(finalTotal)}</span>
              </div>
              <p className="text-xs text-gray-400">+ tax where applicable</p>
            </div>

            {/* Checkout button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
              ) : (
                <><ShoppingCart className="h-4 w-4" /> Checkout — {formatCents(finalTotal)}</>
              )}
            </button>

            {checkoutError && (
              <p className="text-sm text-red-600 text-center">{checkoutError}</p>
            )}

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
