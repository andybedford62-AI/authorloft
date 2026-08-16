/**
 * PageBanner — standard top-of-page header used across all author site pages
 * (About, Books, Contact, Blog, Courses, Flip Books, Specials).
 *
 * Background: the author's accent, deepened until white text clears AAA. The
 *             raw accent used to be painted here with white text on top, which
 *             failed contrast for every live theme — brass gave 2.56:1 and its
 *             60%-opacity label 1.81:1, which is what made the bar look washed
 *             out. Deepening the accent rather than recolouring the text keeps
 *             each author's hue while giving every banner the same dark,
 *             high-contrast treatment. Falls back to navy when no accent is set.
 * Label:      small uppercase text, white/75 (was /60 — unreadable on a light
 *             accent, and there's headroom for it now the ground is dark).
 * Title:      large white serif heading.
 * Subtitle:   optional muted white sub-line.
 */

import { accentAsSurface } from "@/lib/color-contrast";

export function PageBanner({
  label,
  title,
  subtitle,
  accentColor,
}: {
  label: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}) {
  const background = accentColor
    ? accentAsSurface(accentColor)
    : "var(--navy, #1a2236)";

  return (
    <section className="w-full py-7 px-4 text-center" style={{ backgroundColor: background }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/75">
        {label}
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-white/80 text-sm max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </section>
  );
}
