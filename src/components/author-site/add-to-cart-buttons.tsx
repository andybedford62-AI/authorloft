"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartItem } from "@/context/cart-context";

interface DirectSaleItem {
  id:            string;
  format:        string;
  label:         string;
  description:   string | null;
  priceCents:    number;
}

interface AddToCartButtonsProps {
  items:         DirectSaleItem[];
  bookId:        string;
  bookSlug:      string;
  bookTitle:     string;
  coverImageUrl: string | null;
  accentColor:   string;
  formatColors:  Record<string, { color: string; bg: string }>;
}

export function AddToCartButtons({
  items,
  bookId,
  bookSlug,
  bookTitle,
  coverImageUrl,
  accentColor,
  formatColors,
}: AddToCartButtonsProps) {
  const { addItem, isInCart } = useCart();

  return (
    <>
      {items.map((item) => {
        const fmtStyle = formatColors[item.format] ?? formatColors.EBOOK;
        const inCart   = isInCart(item.id);

        function handleAdd() {
          if (inCart) return;
          const cartItem: CartItem = {
            saleItemId:    item.id,
            bookId,
            bookSlug,
            bookTitle,
            coverImageUrl,
            format:        item.format,
            label:         item.label,
            priceCents:    item.priceCents,
          };
          addItem(cartItem);
        }

        return (
          <button
            key={item.id}
            onClick={handleAdd}
            title={item.description ?? undefined}
            disabled={inCart}
            style={inCart ? { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#d1d5db" } : { backgroundColor: accentColor }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm border ${
              inCart
                ? "cursor-default border"
                : "text-white hover:opacity-90"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span>In Cart</span>
                {item.description && (
                  <span
                    className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.color }}
                  >
                    {item.description}
                  </span>
                )}
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>
                  {item.label}
                  {item.priceCents > 0
                    ? ` — ${(item.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}`
                    : " — Free"}
                </span>
                {item.description && (
                  <span
                    className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.color }}
                  >
                    {item.description}
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </>
  );
}
