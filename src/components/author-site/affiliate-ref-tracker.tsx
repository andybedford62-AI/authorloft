"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const REF_COOKIE = "al_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface AffiliateRefTrackerProps {
  bookId: string;
  bookSlug: string;
  domain: string;
}

/**
 * Invisible client component mounted on book detail pages with affiliate
 * tracking enabled. If the page was loaded with ?ref=CODE, it logs a click
 * and stores a 30-day cookie so checkout can attribute the eventual sale.
 */
export function AffiliateRefTracker({ bookId, bookSlug, domain }: AffiliateRefTrackerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    document.cookie = `${REF_COOKIE}=${encodeURIComponent(JSON.stringify({ bookId, refCode: ref }))}; max-age=${REF_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;

    fetch(`/api/public/books/${bookSlug}/ref-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, refCode: ref }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
