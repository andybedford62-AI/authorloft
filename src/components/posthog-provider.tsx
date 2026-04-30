"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams.toString()
        ? `${window.location.origin}${pathname}?${searchParams.toString()}`
        : `${window.location.origin}${pathname}`;
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

/** Drop this inside any layout that already has a NextAuth SessionProvider */
export function PostHogIdentify() {
  const { data: session } = useSession();

  useEffect(() => {
    const user = session?.user as any;
    if (user?.id) {
      posthog.identify(user.id, {
        email:    user.email,
        name:     user.name,
        planTier: user.planTier,
        slug:     user.slug,
      });
    }
  }, [(session?.user as any)?.id]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:         process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false, // handled manually via PostHogPageview
      capture_pageleave: true,
      person_profiles:  "identified_only",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
