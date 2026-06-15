import type { ReactNode } from "react";
import { BookstoreBookCard, type BookstoreBook } from "@/components/marketing/bookstore-book-card";

/**
 * Horizontal, swipeable row of book cards (New / Trending sections).
 * Renders nothing when empty so sparse launches stay clean.
 *
 * - variant "gold": wraps the row in a highlighted gold band so it stands out.
 * - variant "slate": a soft blue/gray band tied to the brand navy (used for Trending).
 * - compact: simplified cards (cover + title + author + View Book only).
 */
const BANDS: Record<string, { wrapper: string; subtitle: string }> = {
  gold:  { wrapper: "border-[#E8C77E] bg-gradient-to-br from-[#FBF3E0] to-[#F2DFB4]", subtitle: "text-[#8a6d33]" },
  slate: { wrapper: "border-[#CAD6E4] bg-[#EAEFF5]",                                  subtitle: "text-[#5C6E89]" },
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
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x scroll-smooth">
      {books.map((b) => (
        <div key={b.id} className="w-40 sm:w-44 shrink-0 snap-start">
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
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47]">
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
      <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-4">
        {icon}
        {title}
      </h2>
      {cards}
    </section>
  );
}
