// Shared colour-contrast helpers for author-site surfaces.
//
// Authors pick their own accent colour, so anything that paints text on the
// accent (or the accent as text) has to decide readability at render time.
// This lived privately inside hero-banner.tsx until a second caller needed it;
// keep new callers pointed here rather than copying the maths again.

function normalize(hex: string): string | null {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) return h.split("").map((c) => c + c).join("");
  return h.length === 6 ? h : null;
}

/** sRGB channel (0-255) → linear-light value, per WCAG 2.x. */
function toLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const h = normalize(hex);
  if (!h) return 0;
  return (
    0.2126 * toLinear(parseInt(h.slice(0, 2), 16)) +
    0.7152 * toLinear(parseInt(h.slice(2, 4), 16)) +
    0.0722 * toLinear(parseInt(h.slice(4, 6), 16))
  );
}

/** WCAG contrast ratio between two colours, from 1 (identical) to 21 (black/white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Rough perceived-lightness check (YIQ). Answers "does this colour read as
 * light?" — useful for picking a surface treatment, but NOT for choosing text
 * colour: use readableTextOn for that, which measures actual contrast.
 */
export function isLightColor(hex: string): boolean {
  const h = normalize(hex);
  if (!h) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/**
 * Text colour that stays readable when painted on `background`.
 *
 * Picks whichever candidate actually has more contrast rather than guessing
 * from a lightness threshold. The YIQ approach this replaced put mid-tone
 * accents on the wrong side of its cutoff — a brass gold like #C89B3C scored
 * 157.6 against a threshold of 160, so it got white text at 2.56:1 when dark
 * text would have given 7.38:1. Mid-tone brand colours are exactly what
 * authors pick, so that band matters.
 */
export function readableTextOn(background: string, dark = "#111", light = "#fff"): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}
