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

  const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  posthog.init(key, {
    // Routed through our own domain via next.config.ts rewrites (see /ingest/*)
    // instead of calling *.i.posthog.com directly — this is PostHog's documented
    // reverse-proxy pattern: same-origin requests are much harder for ad blockers
    // to pattern-match and drop than a recognizable third-party analytics host.
    api_host: "/ingest",
    // Where to send visitors for links back to the PostHog UI (session replay,
    // feature flags, surveys) — api_host is now our own proxy path, not a real
    // PostHog domain, so this has to be set separately.
    ui_host: ingestHost.replace(".i.posthog.com", ".posthog.com"),
    // Autocapture's history-based pageview hook is unreliable across Next.js
    // App Router client-side navigations — capture $pageview manually instead.
    capture_pageview: false,
    // Independent of capture_pageview — without this it defaults to
    // "if_capture_pageview" and silently disables itself alongside it.
    capture_pageleave: true,
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
