import type { ReactNode } from "react";
import { BookstoreBookCard, type BookstoreBook } from "@/components/marketing/bookstore-book-card";

/**
 * Horizontal, swipeable row of book cards (New / Trending sections).
 * Renders nothing when empty so sparse launches stay clean.
 *
 * - variant "gold": wraps the row in a highlighted gold-tinted band so it stands out.
 * - variant "slate": a soft elevated band tied to the brand navy (used for Trending).
 * - compact: simplified cards (cover + title + author + View Book only).
 */
const BANDS: Record<string, { wrapper: string; subtitle: string }> = {
  gold:  { wrapper: "border-[#d6a94a]/30 bg-gradient-to-br from-[#243756] to-[#1e2f4d]", subtitle: "text-[#d6a94a]" },
  slate: { wrapper: "border-[rgba(243,236,219,0.12)] bg-[#1e2f4d]",                       subtitle: "text-[#93a0bc]" },
};

export function BookstoreRow({
  title,
  icon,
  books,
  variant = "default",
  compact = false,
  subtitle,
  quickView = false,
}: {
  title: string;
  icon: ReactNode;
  books: BookstoreBook[];
  variant?: "default" | "gold" | "slate";
  compact?: boolean;
  subtitle?: string;
  quickView?: boolean;
}) {
  if (books.length === 0) return null;

  const cards = (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scroll-smooth">
      {books.map((b) => (
        <div key={b.id} className="w-32 sm:w-36 shrink-0 snap-start">
          <BookstoreBookCard book={b} compact={compact} quickView={quickView} />
        </div>
      ))}
    </div>
  );

  const band = BANDS[variant];
  if (band) {
    return (
      <section className="mb-12">
        <div className={`rounded-3xl border ${band.wrapper} p-6 sm:p-8 shadow-sm`}>
          <h2 className="flex items-center gap-2 font-serif italic text-2xl text-[#f3ecdb]">
            {icon}
            {title}
          </h2>
          {subtitle && <p className={`text-sm ${band.subtitle} mt-1 mb-5`}>{subtitle}</p>}
          <div className={subtitle ? "" : "mt-5"}>{cards}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-2 font-serif italic text-2xl text-[#f3ecdb] mb-4">
        {icon}
        {title}
      </h2>
      {cards}
    </section>
  );
}
