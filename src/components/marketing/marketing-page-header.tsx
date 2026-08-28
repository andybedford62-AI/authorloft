import type { ReactNode } from "react";

interface MarketingPageHeaderProps {
  /** Small mono uppercase label above the title, e.g. "From the team". */
  eyebrow?: string;
  /** Page title. Pass a ReactNode so an accent word can be styled (see usage). */
  title: ReactNode;
  /** Optional supporting line under the title. */
  subtitle?: string;
  /** Optional square logo/badge shown on the right (md+). Ignored when backgroundImage is set. */
  imageSrc?: string;
  imageAlt?: string;
  /**
   * Optional wide banner image used as the band background (subject weighted right,
   * calm space on the left). A navy scrim keeps the left-aligned text readable.
   * When omitted, the band shows the clean navy gradient + texture.
   */
  backgroundImage?: string;
  /**
   * Optional decorative illustration (an inline SVG element) shown to the right
   * of the title on md+ screens, in place of a photo — for pages with no
   * real screenshot or banner photo available. Ignored when backgroundImage
   * is set (a real photo always wins over abstract art). See
   * solution-hero-art.tsx for the current set, one per solution page.
   */
  heroArt?: ReactNode;
}

/**
 * Shared "brand band" hero for secondary marketing pages (Bookstore, Blog, News,
 * Pricing, Features, Resources, Contact). Full-bleed Vault-indigo gradient with a
 * gold hairline, an eyebrow label, an italic serif title, an optional subtitle,
 * and an optional square logo in a white card. Gives every page a consistent,
 * branded header. Colors come from the Vault `@theme` tokens in globals.css —
 * multi-stop gradients read the underlying CSS custom properties directly
 * (var(--color-vault-*)) since Tailwind utilities can't express a 3-stop
 * gradient; everything else uses real vault-* utility classes.
 *
 * Accent a word in the title with: <span className="italic text-vault-gold">Word</span>
 */
export function MarketingPageHeader({ eyebrow, title, subtitle, imageSrc, imageAlt = "", backgroundImage, heroArt }: MarketingPageHeaderProps) {
  const hasBanner = !!backgroundImage;
  const hasHeroArt = !hasBanner && !!heroArt;

  return (
    <section className="relative overflow-hidden bg-vault-surf">
      {hasBanner ? (
        <>
          {/* Banner image — subject weighted right, calm space left. object-contain
              shows the full image (no cropping); navy bg fills the remaining space. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundImage} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-right" />
          {/* Navy scrim so the left-aligned text stays readable over the art —
              stays dark across the text column even on bright/light photos,
              then fades out toward the right where the image is the focus. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, var(--color-vault-bg) 0%, rgba(22,35,61,0.96) 35%, rgba(22,35,61,0.82) 55%, rgba(22,35,61,0.45) 75%, rgba(22,35,61,0.08) 100%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Gradient base */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(120deg, var(--color-vault-bg) 0%, var(--color-vault-surf) 55%, var(--color-vault-surf-2) 100%)" }}
          />
          {/* Fine vertical threadlines for subtle texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 22px)",
            }}
          />
          {/* Soft gold glow, top-right */}
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-vault-gold) 18%, transparent), transparent 70%)" }}
          />
        </>
      )}

      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex items-center justify-between gap-8 ${hasBanner ? "min-h-[260px] sm:min-h-[320px]" : ""}`}>
        <div className="min-w-0 max-w-xl">
          {eyebrow && (
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-vault-gold mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">· {eyebrow} ·</p>
          )}
          <h1 className="font-vault-display italic text-4xl sm:text-5xl text-vault-ink font-normal leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">{title}</h1>
          {subtitle && <p className="mt-4 text-base text-vault-mute max-w-xl leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">{subtitle}</p>}
        </div>

        {hasHeroArt && (
          <div className="hidden md:flex flex-shrink-0 w-64 lg:w-80" aria-hidden>
            {heroArt}
          </div>
        )}

        {imageSrc && !hasBanner && !hasHeroArt && (
          <div className="hidden md:flex flex-shrink-0">
            <span className="inline-flex items-center justify-center bg-white rounded-2xl p-2 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt={imageAlt} className="h-32 w-32 object-contain rounded-xl" />
            </span>
          </div>
        )}
      </div>

      {/* Gold hairline */}
      <div aria-hidden className="relative h-[3px] bg-gradient-to-r from-transparent via-vault-gold to-transparent" />
    </section>
  );
}
