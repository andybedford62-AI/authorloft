"use client";

import posthog from "posthog-js";

let initialized = false;

/**
 * Initializes PostHog for browser-side capture, but only if the visitor has
 * already accepted analytics via the ConsentBanner. Matches the promise on
 * the /gdpr page: no tracking cookies without consent.
 */
export function initPostHogIfConsented() {
  if (initialized || typeof window === "undefined") return;

  const consent = localStorage.getItem("analytics-consent");
  if (consent !== "accepted") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Autocapture's history-based pageview hook is unreliable across Next.js
    // App Router client-side navigations — capture $pageview manually instead.
    capture_pageview: false,
    person_profiles: "identified_only",
  });
  initialized = true;
}

export function capturePageview(url: string) {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: url });
}

export function optOutPostHog() {
  if (initialized) posthog.opt_out_capturing();
}
