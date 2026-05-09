"use client";

import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";

/**
 * Hook that retrieves the CSRF token from the current session.
 * Returns the token to include in the X-CSRF-Token header for API requests.
 */
export function useCSRFToken(): string {
  const { data: session } = useSession();

  return useMemo(() => {
    return (session?.user as any)?.csrfToken || "";
  }, [session?.user]);
}

/**
 * Hook that provides a fetch function with automatic CSRF token injection.
 * Use this in components instead of raw fetch() for API calls.
 */
export function useFetchWithCSRF() {
  const csrfToken = useCSRFToken();

  return useCallback(
    (url: string, options: RequestInit = {}) => {
      const method = (options.method || "POST").toUpperCase();
      const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"];

      const headers: HeadersInit = {
        ...options.headers,
      };

      // Add CSRF token to state-changing requests
      if (stateChangingMethods.includes(method) && csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      return fetch(url, {
        ...options,
        method,
        headers,
      });
    },
    [csrfToken]
  );
}
