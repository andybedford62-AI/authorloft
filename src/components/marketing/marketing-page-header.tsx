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
}

/**
 * Shared "brand band" hero for secondary marketing pages (Bookstore, Blog, News,
 * Pricing, Features, Resources, Contact). Full-bleed navy gradient with a brass
 * hairline, an eyebrow label, a serif title, an optional subtitle, and an optional
 * square logo in a white card. Gives every page a consistent, branded header.
 *
 * Accent a word in the title with: <span className="italic text-[#D4AE6A]">Word</span>
 */
export function MarketingPageHeader({ eyebrow, title, subtitle, imageSrc, imageAlt = "", backgroundImage }: MarketingPageHeaderProps) {
  const hasBanner = !!backgroundImage;

  return (
    <section className="relative overflow-hidden bg-[#1B2B47]">
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
                "linear-gradient(90deg, #0F1A2D 0%, rgba(15,26,45,0.96) 35%, rgba(15,26,45,0.82) 55%, rgba(15,26,45,0.45) 75%, rgba(15,26,45,0.08) 100%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Gradient base */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(120deg, #0F1A2D 0%, #1B2B47 55%, #27406B 100%)" }}
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
          {/* Soft brass glow, top-right */}
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,174,106,0.18), transparent 70%)" }}
          />
        </>
      )}

      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex items-center justify-between gap-8 ${hasBanner ? "min-h-[260px] sm:min-h-[320px]" : ""}`}>
        <div className="min-w-0 max-w-xl">
          {eyebrow && (
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AE6A] mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">· {eyebrow} ·</p>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl text-white font-normal leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">{title}</h1>
          {subtitle && <p className="mt-4 text-base text-[#D4DDEB] max-w-xl leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">{subtitle}</p>}
        </div>

        {imageSrc && !hasBanner && (
          <div className="hidden md:flex flex-shrink-0">
            <span className="inline-flex items-center justify-center bg-white rounded-2xl p-2 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt={imageAlt} className="h-32 w-32 object-contain rounded-xl" />
            </span>
          </div>
        )}
      </div>

      {/* Brass hairline */}
      <div aria-hidden className="relative h-[3px] bg-gradient-to-r from-transparent via-[#B8893D] to-transparent" />
    </section>
  );
}
