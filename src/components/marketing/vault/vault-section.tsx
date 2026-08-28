import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { cn } from "@/lib/utils";

type VaultSectionTone = "bg" | "bg-deep" | "surf" | "surf2" | "cream";

const TONE_BG: Record<VaultSectionTone, string> = {
  bg: "bg-vault-bg",
  "bg-deep": "bg-vault-bg-deep",
  surf: "bg-vault-surf",
  surf2: "bg-vault-surf-2",
  cream: "bg-vault-cream",
};

/**
 * Layout wrapper for a Vault marketing section: enforces left-aligned
 * headline blocks (not centered — one of the explicit old-system tells this
 * redesign is eliminating) and consistent vertical rhythm, and is the home
 * of the shared scroll-reveal entrance motion so pages don't reinvent it.
 */
export function VaultSection({
  tone = "bg",
  eyebrow,
  title,
  description,
  children,
  className,
  reveal = true,
  bordered = true,
  id,
}: {
  tone?: VaultSectionTone;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  reveal?: boolean;
  bordered?: boolean;
  /** For nav anchor links (e.g. /solutions#your-platform) — includes scroll-margin so the sticky header doesn't cover the heading. */
  id?: string;
}) {
  const isLight = tone === "cream";

  const inner = (
    <div className="max-w-[1100px] mx-auto">
      {(eyebrow || title || description) && (
        <div className="max-w-xl mb-8 text-left">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.12em] mb-3.5",
                isLight ? "text-vault-gold-muted" : "text-vault-gold"
              )}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              className={cn(
                "font-vault-display italic text-[clamp(2.1rem,4vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.01em] mb-4",
                isLight ? "text-vault-cream-ink" : "text-vault-ink"
              )}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className={cn(
                "text-[1.0625rem] leading-[1.72] max-w-lg",
                isLight ? "text-vault-cream-mute" : "text-vault-mute"
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <section
      id={id}
      className={cn(
        "py-16 px-7",
        id && "scroll-mt-24",
        bordered && (isLight ? "border-t border-b border-vault-cream-border" : "border-t border-b border-vault-line"),
        TONE_BG[tone],
        className
      )}
    >
      {reveal ? <ScrollReveal>{inner}</ScrollReveal> : inner}
    </section>
  );
}
