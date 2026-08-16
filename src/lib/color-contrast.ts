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

// ── Accent-as-text ───────────────────────────────────────────────────────────

function toHsl(hex: string): { h: number; s: number; l: number } | null {
  const n = normalize(hex);
  if (!n) return null;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * An author's accent, adjusted only as far as it must be to stay readable as
 * TEXT on `background`.
 *
 * Authors pick their own accent with no contrast warning in the picker, and
 * templates paint it directly as text on near-white surfaces (section eyebrows,
 * series links, "About the Author" labels). A pale accent there fails WCAG AA
 * outright.
 *
 * Hue and saturation are preserved and only lightness moves — away from the
 * background — so the result still reads as the author's colour rather than a
 * generic grey. An accent that already passes is returned untouched, so most
 * authors see no change at all.
 */
export function accentAsTextOn(
  accent: string,
  background = "#fff",
  minRatio = 4.5
): string {
  if (contrastRatio(accent, background) >= minRatio) return accent;

  const hsl = toHsl(accent);
  if (!hsl) return readableTextOn(background);

  // Light background → darken the accent; dark background → lighten it.
  const darken = relativeLuminance(background) > 0.18;
  const step = darken ? -0.02 : 0.02;

  let { l } = hsl;
  for (let i = 0; i < 50; i++) {
    l += step;
    if (l <= 0 || l >= 1) break;
    const candidate = hslToHex(hsl.h, hsl.s, l);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  // Nothing in the hue passed (very low-saturation accents on mid grounds) —
  // fall back to plain readable text rather than shipping something illegible.
  return readableTextOn(background);
}
