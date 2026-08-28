import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type VaultCardTone = "surf" | "surf2";

const TONE_CLASSES: Record<VaultCardTone, string> = {
  surf: "bg-vault-surf",
  surf2: "bg-vault-surf-2",
};

/**
 * The surf/surf2 + hairline-border card pattern repeated across pricing,
 * testimonials, and feature sections. One implementation instead of each
 * section hand-rolling its own background/border combo.
 */
export function VaultCard({
  tone = "surf",
  className,
  children,
  ...rest
}: {
  tone?: VaultCardTone;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return (
    <div className={cn("rounded-2xl border border-vault-line", TONE_CLASSES[tone], className)} {...rest}>
      {children}
    </div>
  );
}
