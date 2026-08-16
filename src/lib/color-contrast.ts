// Shared colour-contrast helpers for author-site surfaces.
//
// Authors pick their own accent colour, so anything that paints text on the
// accent (or the accent as text) has to decide readability at render time.
// This lived privately inside hero-banner.tsx until a second caller needed it;
// keep new callers pointed here rather than copying the maths again.

/** Rough luminance check — returns true if the colour is light (use dark text on it). */
export function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/** Text colour that stays readable when painted on top of `background`. */
export function readableTextOn(background: string, dark = "#111", light = "#fff"): string {
  return isLightColor(background) ? dark : light;
}
