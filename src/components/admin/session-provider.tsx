"use client";

import { SessionProvider } from "next-auth/react";
import { SessionExpiryGuard } from "./session-expiry-guard";

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionExpiryGuard />
      {children}
    </SessionProvider>
  );
}
