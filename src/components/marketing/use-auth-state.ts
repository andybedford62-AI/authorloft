"use client";

import { useEffect, useState } from "react";

export type AuthState = { isAuthor: boolean; displayName: string | null };

const SIGNED_OUT: AuthState = { isAuthor: false, displayName: null };

// One request per page load, shared by the nav, mobile menu and homepage hero.
let pending: Promise<AuthState> | null = null;

function loadAuthState(): Promise<AuthState> {
  if (!pending) {
    pending = fetch("/api/marketing/auth-state", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<AuthState>) : SIGNED_OUT))
      .catch(() => SIGNED_OUT);
  }
  return pending;
}

/** Marketing pages are statically cached, so signed-in state is fetched in the browser. Starts signed-out. */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(SIGNED_OUT);
  useEffect(() => {
    let live = true;
    loadAuthState().then((s) => { if (live) setState(s); });
    return () => { live = false; };
  }, []);
  return state;
}
