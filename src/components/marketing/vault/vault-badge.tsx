import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type VaultBadgeTone = "gold" | "good";

const TONE_CLASSES: Record<VaultBadgeTone, string> = {
  gold: "bg-vault-gold/12 text-vault-gold",
  good: "bg-vault-good/15 text-vault-good",
};

/**
 * Pill shape is intentionally reserved for badges/status chips — a
 * deliberate, distinct convention from VaultButton's 6px-radius CTAs, not
 * an accident of which file someone copied from.
 */
export function VaultBadge({
  tone = "gold",
  className,
  children,
}: {
  tone?: VaultBadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
