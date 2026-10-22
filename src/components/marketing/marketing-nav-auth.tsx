"use client";

import { LayoutDashboard } from "lucide-react";
import { VaultButton } from "@/components/marketing/vault";
import { useAuthState } from "@/components/marketing/use-auth-state";

/** Left side of the nav: author name + Dashboard button once we know the visitor is signed in. */
export function MarketingNavAuthLeft() {
  const { isAuthor, displayName } = useAuthState();
  if (!isAuthor) return null;
  return (
    <>
      <span className="hidden sm:block text-vault-ink/20 select-none">|</span>
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-vault-mute">{displayName}</span>
        <VaultButton href="/admin/dashboard" variant="subtle" size="sm">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </VaultButton>
      </div>
    </>
  );
}

/** Right side of the nav: Sign in / Start free, or a Dashboard button on mobile when signed in. */
export function MarketingNavAuthRight() {
  const { isAuthor } = useAuthState();
  if (isAuthor) {
    return (
      <VaultButton href="/admin/dashboard" variant="subtle" size="sm" className="flex sm:hidden">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Dashboard
      </VaultButton>
    );
  }
  return (
    <>
      <VaultButton href="/login" variant="secondary" className="hidden sm:inline-flex">
        Sign in
      </VaultButton>
      <VaultButton href="/register" variant="primary" className="hidden sm:inline-flex">
        Start free →
      </VaultButton>
    </>
  );
}
