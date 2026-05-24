"use client";

import { useEffect } from "react";

export function DashboardTracker({
  onboardingComplete,
  bookCount,
  planTier,
}: {
  onboardingComplete: boolean;
  bookCount: number;
  planTier: string;
}) {
  useEffect(() => {
    fetch("/api/admin/analytics/track", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        event:      "dashboard_viewed",
        properties: { onboarding_complete: onboardingComplete, book_count: bookCount, plan_tier: planTier },
      }),
    }).catch(() => {});
  // Only fire once per mount — props are stable dashboard data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
