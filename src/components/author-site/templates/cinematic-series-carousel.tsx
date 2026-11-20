"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SeriesForTemplate } from "./types";

// Series accent colours (cycles by index)
const SERIES_ACCENTS = [
  ["#1E3A5F", "#2C507F"],
  ["#1F3A2F", "#2A5040"],
  ["#3A1E5F", "#50307F"],
  ["#3A2A1E", "#5A3E28"],
];

interface Props {
  series: SeriesForTemplate[];
  accentColor: string;
}

/** Single-row, horizontally scrolling series cards. Arrows only appear when
 *  the row actually overflows, so a 1–3 series author sees no carousel chrome. */
export function CinematicSeriesCarousel({ series, accentColor }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, series.length]);

  function scrollByCard(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: "smooth" });
  }

  const arrowCls =
    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-opacity hover:opacity-80";

  return (
    <div className="relative">
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous series"
          className={`${arrowCls} -left-4`}
          style={{ background: "#050D1Ccc", borderColor: accentColor + "66", color: accentColor }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next series"
          className={`${arrowCls} -right-4`}
          style={{ background: "#050D1Ccc", borderColor: accentColor + "66", color: accentColor }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {series.map((s, i) => {
          const [colorA, colorB] = SERIES_ACCENTS[i % SERIES_ACCENTS.length];
          const cover = s.books.find((b) => b.coverImageUrl);
          return (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className="group relative flex-none snap-start w-[240px] sm:w-[270px] overflow-hidden rounded-sm transition-transform duration-300 hover:-translate-y-1"
              style={{
                background: `linear-gradient(160deg, ${colorA} 0%, ${colorB} 100%)`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050D1C]/90 via-[#050D1C]/30 to-transparent" />

              {cover?.coverImageUrl && (
                <div
                  className="absolute top-3 right-3 w-14 aspect-[2/3] rounded-sm overflow-hidden opacity-70"
                  style={{
                    transform: "perspective(600px) rotateY(-14deg)",
                    boxShadow: "4px 6px 12px rgba(0,0,0,0.5)",
                  }}
                >
                  <Image src={cover.coverImageUrl} alt={s.name} fill sizes="56px" className="object-cover" />
                </div>
              )}

              <div className="relative z-10 p-5 pt-20">
                <span
                  className="inline-block text-[9px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded-full"
                  style={{ background: accentColor + "22", color: accentColor }}
                >
                  {s.books.length} {s.books.length === 1 ? "book" : "books"}
                </span>
                <h3 className="author-font-heading text-[17px] text-[#FBF6E9] leading-tight mb-1.5 line-clamp-2">
                  {s.name}
                </h3>
                {s.description && (
                  <p className="text-xs text-[#FBF6E9]/60 line-clamp-1 mb-3">{s.description}</p>
                )}
                <span
                  className="flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: accentColor }}
                >
                  Explore series
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
