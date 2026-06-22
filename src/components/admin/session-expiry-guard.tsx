"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * "End session when browser closes" guard.
 *
 * NextAuth issues a 24-hour persistent cookie, which means closing and
 * reopening the browser leaves the user signed in. That occasionally causes
 * stale-state errors on return (e.g. a JWT that points at a record edited in
 * another tab/window).
 *
 * This guard uses `sessionStorage` — which is cleared automatically when the
 * browser is closed — to detect a fresh browser open. When that happens and a
 * NextAuth session is still active, we sign the user out (silently, no
 * redirect) so the next interaction lands them on /login fresh.
 *
 * In-session navigation (clicking around, hard-refresh, opening a new tab in
 * the same browser session) keeps the flag, so the user is NOT signed out.
 *
 * Safe in private/incognito browsing (sessionStorage works there) and falls
 * back to a no-op if storage is unavailable.
 */
const STORAGE_KEY = "al.sess.alive";

export function SessionExpiryGuard() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    try {
      const alive = window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.setItem(STORAGE_KEY, "1");

      if (alive !== "1") {
        // Fresh browser open with a leftover persistent cookie — clear it.
        signOut({ redirect: false });
      }
    } catch {
      // sessionStorage unavailable (e.g. strict privacy mode) — no-op
    }
  }, [status]);

  return null;
}
