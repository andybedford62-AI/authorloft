"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHogIfConsented, capturePageview } from "@/lib/posthog-client";

/**
 * Mounted once in the root layout. Initializes PostHog (if consented) and
 * fires a $pageview on every route change — Next.js App Router navigations
 * are client-side and don't trigger a full page load, so this can't rely on
 * PostHog's built-in autocapture history hook.
 */
export function PostHogPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHogIfConsented();
  }, []);

  useEffect(() => {
    initPostHogIfConsented();
    capturePageview(window.location.href);
  }, [pathname]);

  return null;
}
