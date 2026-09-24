"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { getRetailer } from "@/lib/retailers";
import { formatCents } from "@/lib/utils";
import type { FormatOption } from "@/lib/book-formats";
import { ReaderMagnetButton } from "@/components/author-site/reader-magnet-button";

// Format-first buy area for a book page: pick a format card, and the panel
// below shows how to buy that format — buying direct first (the author keeps
// the most), then the stores that sell it. On phones a sticky bar keeps the
// price and a buy button in reach whenever the panel is off screen.

export function BookFormatBuy({
  options,
  book,
  authorId,
  authorFirstName,
  accentColor,
  accentSurface,
}: {
  options: FormatOption[];
  book: { id: string; slug: string; title: string; coverImageUrl: string | null };
  authorId: string;
  authorFirstName: string;
  accentColor: string;
  /** Accent deepened for white text on it (see accentAsSurface). */
  accentSurface: string;
}) {
  const { addItem, isInCart } = useCart();
  const [selected, setSelected] = useState<string>(
    () => (options.find((o) => o.directItems.length) ?? options.find((o) => o.priceCents !== null) ?? options[0]).id
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelVisible, setPanelVisible] = useState(true);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fmt = options.find((o) => o.id === selected) ?? options[0];
  const primaryDirect = fmt.directItems[0];

  function addToCart(item: FormatOption["directItems"][number]) {
    addItem({
      saleItemId:    item.id,
      bookId:        book.id,
      bookSlug:      book.slug,
      bookTitle:     book.title,
      coverImageUrl: book.coverImageUrl,
      format:        item.format,
      label:         item.label,
      priceCents:    item.priceCents,
    });
  }

  const hasAnyWay = fmt.directItems.length + fmt.magnetItems.length + fmt.stores.length > 0;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Choose a format</p>

      {/* Cards: a wrapping grid from sm up, a sideways-scrolling row on phones */}
      <div
        role="radiogroup"
        aria-label="Format"
        className="flex gap-2.5 overflow-x-auto pt-2.5 pb-1.5 -mx-1 px-1 snap-x sm:grid sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:overflow-visible"
      >
        {options.map((o) => {
          const on = o.id === fmt.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(o.id)}
              className={`relative flex-none w-[132px] sm:w-auto snap-start text-left rounded-xl border-[1.5px] bg-white px-3 pt-3 pb-2.5 transition-shadow ${
                on ? "" : "border-gray-200 hover:border-gray-300"
              }`}
              style={on ? { borderColor: accentColor, boxShadow: `0 0 0 3px ${accentColor}22` } : undefined}
            >
              {o.priceIsDirect && (
                <span className="absolute -top-2.5 right-2.5 rounded-full bg-emerald-700 px-2 py-0.5 text-[10.5px] font-bold text-white">
                  Buy direct
                </span>
              )}
              <span className="block text-sm font-bold text-gray-900">{o.name}</span>
              {o.priceCents !== null ? (
                <span className="block text-lg font-extrabold text-gray-900 mt-0.5">{formatCents(o.priceCents)}</span>
              ) : (
                <span className="block text-sm text-gray-400 mt-1">See stores</span>
              )}
              <span className="block text-[11.5px] text-gray-500">
                {o.priceIsDirect ? `from ${authorFirstName}` : "\u00a0"}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={panelRef} id="buy" className="mt-3.5 rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3 scroll-mt-24">
        {fmt.directItems.map((item) => {
          const inCart = isInCart(item.id);
          return (
            <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-xl border border-emerald-200 bg-white px-3.5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-gray-900">
                  Buy the {fmt.name.toLowerCase()} direct from {authorFirstName}
                </p>
                <p className="text-xs text-gray-500">{item.description || item.label}</p>
              </div>
              <span className="text-xl font-extrabold text-gray-900">{formatCents(item.priceCents)}</span>
              <button
                type="button"
                onClick={() => addToCart(item)}
                disabled={inCart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:bg-gray-100 disabled:text-gray-700"
                style={inCart ? undefined : { backgroundColor: accentSurface }}
              >
                {inCart ? <><Check className="h-4 w-4 text-emerald-600" /> In cart</> : <><ShoppingCart className="h-4 w-4" /> Add to cart</>}
              </button>
            </div>
          );
        })}

        {fmt.magnetItems.map((item) => (
          <ReaderMagnetButton
            key={item.id}
            bookId={book.id}
            saleItemId={item.id}
            authorId={authorId}
            bookTitle={book.title}
            format={item.format}
            label={item.label}
            coverImageUrl={book.coverImageUrl}
            accentColor={accentColor}
            formatColor="#047857"
            formatBg="#ecfdf5"
          />
        ))}

        {fmt.stores.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              {fmt.directItems.length ? "Also available at" : `Buy the ${fmt.name.toLowerCase()} at`}
            </p>
            <div className="flex flex-wrap gap-2">
              {fmt.stores.map((s) => {
                const info = getRetailer(s.retailer);
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none basis-full sm:basis-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 sm:py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ borderColor: info.color, color: info.color, backgroundColor: info.badgeBg }}
                  >
                    {s.label.replace(/^Buy on /, "")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {!hasAnyWay && (
          <p className="text-sm text-gray-500">The {fmt.name.toLowerCase()} isn&apos;t available to buy online yet.</p>
        )}
      </div>

      {/* Phone-only sticky bar, shown while the buy panel is off screen */}
      {hasAnyWay && !panelVisible && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-2.5 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
          <div className="flex-1 min-w-0 text-xs text-gray-500">
            {fmt.name}
            <span className="block text-[15px] font-bold text-gray-900">
              {fmt.priceCents !== null ? formatCents(fmt.priceCents) : "Choose a store"}
            </span>
          </div>
          {primaryDirect && !isInCart(primaryDirect.id) ? (
            <button
              type="button"
              onClick={() => addToCart(primaryDirect)}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: accentSurface }}
            >
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </button>
          ) : (
            <button
              type="button"
              onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: accentSurface }}
            >
              Buy options
            </button>
          )}
        </div>
      )}
    </div>
  );
}
