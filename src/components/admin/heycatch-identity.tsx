"use client";

import { useEffect } from "react";
import { analytics } from "@heycatch/sdk";

/** Tells HeyCatch who the signed-in author is. Rendered once from the admin layout. */
export function HeyCatchIdentity({
  id,
  email,
  name,
  plan,
}: {
  id: string;
  email?: string | null;
  name?: string | null;
  plan?: string;
}) {
  useEffect(() => {
    analytics.setIdentity(id, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(plan ? { plan } : {}),
    });
  }, [id, email, name, plan]);
  return null;
}
