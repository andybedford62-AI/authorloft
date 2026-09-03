// AuthorLoft Site Themes
// Maps to CSS [data-theme='x'] variables defined in globals.css
// Base themes: Standard+ | Genre palettes: Premium only

export type ThemeId =
  | "classic-literary"
  | "modern-minimal"
  | "dark-elegant"
  | "thriller"
  | "fantasy"
  | "romance"
  | "scifi"
  | "nautical"
  | "childrens"
  | "literary"
  | "western"
  | "cinematic"
  // Subgenre palettes
  | "aviation"
  | "scuba-diving"
  | "mountain-adventure"
  // Music genre palettes
  | "rock"
  | "country"
  | "pop"
  | "hip-hop"
  | "electronic"
  | "jazz"
  | "classical"
  | "rnb";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  isPremium: boolean;   // true = Premium only
  dataTheme: string;    // maps to [data-theme='x'] in CSS
  preview: {
    bg: string;         // main background colour
    primary: string;    // text / primary colour
    accent: string;     // accent / button colour
  };
  swatches?: string[];  // colour strip for genre palettes
  emoji?: string;
  mood?: string;
  defaultHeroImageUrl?: string;  // curated fallback hero image when the author hasn't uploaded one
}

// ── Base Themes (Standard+) ──────────────────────────────────────────────────

export const BASE_THEMES: ThemeDefinition[] = [
  {
    id: "classic-literary",
    name: "Classic Literary",
    description: "Warm cream tones with navy accents — timeless and sophisticated.",
    isPremium: false,
    dataTheme: "",  // default — no data-theme attribute needed
    preview: { bg: "#faf7f2", primary: "#1e2a3a", accent: "#c89b3c" },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Crisp white with bold black typography — clean and contemporary.",
    isPremium: false,
    dataTheme: "modern",
    preview: { bg: "#ffffff", primary: "#0a0a0a", accent: "#6366f1" },
  },
  {
    id: "dark-elegant",
    name: "Dark Elegant",
    description: "Rich dark backgrounds with gold highlights — dramatic and immersive.",
    isPremium: false,
    dataTheme: "dark",
    preview: { bg: "#0d1117", primary: "#f0ece4", accent: "#c89b3c" },
  },
];

// ── Genre & Style Palettes (Standard+) ──────────────────────────────────────
// Merged genre + subgenre palettes — no internal premium/non-premium split.
// Premium differentiation comes from custom accent/secondary colours and the
// Cinematic page-structure template, not from palette access.

export const GENRE_PALETTES: ThemeDefinition[] = [
  {
    id: "thriller",
    name: "Thriller / Suspense",
    description: "High-contrast, tense, cinematic",
    isPremium: false,
    dataTheme: "thriller",
    emoji: "🎬",
    mood: "High-contrast, tense, cinematic",
    preview: { bg: "#d8dbe0", primary: "#0b1220", accent: "#c0392b" },
    swatches: ["#0b1220", "#1a3550", "#c0392b", "#e74c3c", "#e5e5e5", "#bdc3c7", "#95a5a6", "#7f8c8d", "#2c3e50"],
  },
  {
    id: "fantasy",
    name: "Epic Fantasy",
    description: "Mythic, luminous, magical",
    isPremium: false,
    dataTheme: "fantasy",
    emoji: "✨",
    mood: "Mythic, luminous, magical",
    preview: { bg: "#e9ddd0", primary: "#2d1b5e", accent: "#d4a843" },
    swatches: ["#2d1b5e", "#6b35a8", "#d4a843", "#f0c060", "#f5f0e8", "#e8dcc8", "#9b7fd4", "#4a2080", "#1a0d38"],
  },
  {
    id: "romance",
    name: "Romance",
    description: "Warm, soft, emotional",
    isPremium: false,
    dataTheme: "romance",
    emoji: "💕",
    mood: "Warm, soft, emotional",
    preview: { bg: "#f8e2df", primary: "#7a2040", accent: "#f4a8b8" },
    swatches: ["#7a2040", "#b84c6e", "#f4a8b8", "#ffd4a8", "#fff8f6", "#ffe4e0", "#e87090", "#c0385a", "#4a1028"],
  },
  {
    id: "scifi",
    name: "Science Fiction",
    description: "Neon, sleek, futuristic",
    isPremium: false,
    dataTheme: "scifi",
    emoji: "🚀",
    mood: "Neon, sleek, futuristic",
    preview: { bg: "#060b18", primary: "#e0eeff", accent: "#00f5ff" },
    swatches: ["#060b18", "#0a1628", "#00f5ff", "#0080ff", "#e0eeff", "#80c0ff", "#004080", "#002040", "#00a0b0"],
  },
  {
    id: "nautical",
    name: "Nautical / Marine",
    description: "Pressure, depth, cold metallic",
    isPremium: false,
    dataTheme: "nautical",
    emoji: "🌊",
    mood: "Pressure, depth, cold metallic",
    preview: { bg: "#dde9f0", primary: "#001f3f", accent: "#ff9500" },
    swatches: ["#001f3f", "#003366", "#ff9500", "#ffb84d", "#eef4f8", "#c8dce8", "#4a7fa0", "#1a4060", "#002850"],
  },
  {
    id: "childrens",
    name: "Children's Books",
    description: "Bright, friendly, playful",
    isPremium: false,
    dataTheme: "childrens",
    emoji: "🌈",
    mood: "Bright, friendly, playful",
    preview: { bg: "#eaf8f6", primary: "#1a5c5a", accent: "#ffd93d" },
    swatches: ["#1a5c5a", "#2eada8", "#ffd93d", "#ff6b6b", "#ffffff", "#f0fafa", "#4ecdc4", "#ffe66d", "#ff8e53"],
  },
  {
    id: "literary",
    name: "Literary Fiction",
    description: "Minimalist, elegant, muted",
    isPremium: false,
    dataTheme: "literary",
    emoji: "📖",
    mood: "Minimalist, elegant, muted",
    preview: { bg: "#ece7e2", primary: "#1a1a1a", accent: "#8b6f5e" },
    swatches: ["#1a1a1a", "#2c2c2c", "#8b6f5e", "#a88070", "#fafafa", "#f0f0f0", "#d4c4bc", "#6a5048", "#3a2820"],
  },
  {
    id: "western",
    name: "Country / Western",
    description: "Rustic, warm, earthy",
    isPremium: false,
    dataTheme: "western",
    emoji: "🤠",
    mood: "Rustic, warm, earthy",
    preview: { bg: "#e9d8c2", primary: "#3d1f0d", accent: "#c07830" },
    swatches: ["#3d1f0d", "#6b3518", "#c07830", "#d4944a", "#f5ede0", "#e8d4b8", "#a06028", "#804818", "#2a1008"],
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Deep navy editorial with gold accents — atmospheric and immersive.",
    isPremium: false,
    dataTheme: "cinematic",
    emoji: "🎬",
    mood: "Cinematic · Editorial · Atmospheric",
    preview: { bg: "#0A192F", primary: "#FBF6E9", accent: "#D4AF37" },
    swatches: ["#050D1C","#0A192F","#1E3A5F","#D4AF37","#E8D08A","#B8932A","#FBF6E9","#F5EBD3","#E8DCB6"],
  },
];

// ── Subgenre Palettes (Standard+) ───────────────────────────────────────────
// Specialised palettes for niche subgenres — merged with GENRE_PALETTES above
// into STYLE_PALETTES (no separate gating). Added to over time — this is the
// first phase (aviation, scuba/underwater).

export const SUBGENRE_PALETTES: ThemeDefinition[] = [
  {
    id: "aviation",
    name: "Aviation / Flying Adventure",
    description: "Open sky, chrome cockpit, golden-hour horizon — soaring and adventurous.",
    isPremium: false,
    dataTheme: "aviation",
    emoji: "✈️",
    mood: "Soaring, technical, golden-hour adventure",
    preview: { bg: "#dce6f0", primary: "#0E2A4A", accent: "#FF7A30" },
    swatches: ["#0E2A4A", "#1B4D7E", "#4F9FD6", "#A9D6F0", "#F0F4F8", "#C9D6E0", "#FF7A30", "#FFB677", "#08182C"],
    defaultHeroImageUrl: "/images/themes/aviation-hero.jpg",
  },
  {
    id: "scuba-diving",
    name: "Scuba / Underwater Adventure",
    description: "Deep-reef teal with coral accents — immersive and exploratory.",
    isPremium: false,
    dataTheme: "scuba-diving",
    emoji: "🤿",
    mood: "Immersive, exploratory, deep-reef adventure",
    preview: { bg: "#dbf0ee", primary: "#073B3F", accent: "#FF6F5E" },
    swatches: ["#073B3F", "#0E5E5C", "#1FA8A0", "#7FE0D6", "#F2F9F8", "#CDEDE8", "#FF6F5E", "#FFB199", "#04282B"],
    defaultHeroImageUrl: "/images/themes/scuba-diving-hero.jpg",
  },
  {
    id: "mountain-adventure",
    name: "Mountain / Outdoor Adventure",
    description: "Granite peaks, pine forests, and glacier-blue horizons — rugged and expansive.",
    isPremium: false,
    dataTheme: "mountain-adventure",
    emoji: "🏔️",
    mood: "Rugged, expansive, alpine adventure",
    preview: { bg: "#e1e7e0", primary: "#2E3D31", accent: "#4A90A4" },
    swatches: ["#2E3D31", "#4F6B52", "#9CB89E", "#D6E2D7", "#F3F5F2", "#DCE3DD", "#4A90A4", "#A8D2DC", "#161F18"],
    defaultHeroImageUrl: "/images/themes/mountain-adventure-hero.jpg",
  },
];

/** Merged genre + subgenre palettes — single Standard+ collection, no internal split. */
export const STYLE_PALETTES = [...GENRE_PALETTES, ...SUBGENRE_PALETTES];

// ── Music Genre Palettes (Standard+) ─────────────────────────────────────────
// Same Standard+ availability as the book GENRE_PALETTES above — kept as a
// separate array (not merged into STYLE_PALETTES) so the appearance picker can
// render them in their own "Music Genre Palettes" section instead of mixing
// book and music genres into one long, cluttered grid. Header images follow
// the same public/images/themes/{id}-hero.jpg convention as the book palettes
// (auto-detected at build time via theme-hero-manifest.ts) — none exist yet,
// so these render as solid colour until real/curated photos are added.
export const MUSIC_GENRE_PALETTES: ThemeDefinition[] = [
  {
    id: "rock",
    name: "Rock",
    description: "Raw, electric, rebellious",
    isPremium: false,
    dataTheme: "rock",
    emoji: "🎸",
    mood: "Raw, electric, rebellious",
    preview: { bg: "#0d0d0d", primary: "#f2f2f2", accent: "#dd2338" },
    swatches: ["#0d0d0d", "#1a1a1a", "#dd2338", "#ff4d5e", "#f2f2f2", "#cccccc", "#8a8a8a", "#3d3d3d", "#2b0a0d"],
  },
  {
    id: "country",
    name: "Country",
    description: "Warm, rustic, open-road Americana",
    isPremium: false,
    dataTheme: "country",
    emoji: "🪕",
    mood: "Warm, rustic, open-road Americana",
    preview: { bg: "#f5ecdc", primary: "#4a2f1a", accent: "#cd8a3a" },
    swatches: ["#4a2f1a", "#6b4526", "#cd8a3a", "#e0ac66", "#f9f2e6", "#eaddc4", "#a97c48", "#7a5228", "#2e1c0f"],
  },
  {
    id: "pop",
    name: "Pop",
    description: "Bright, bold, high-energy",
    isPremium: false,
    dataTheme: "pop",
    emoji: "🎤",
    mood: "Bright, bold, high-energy",
    preview: { bg: "#ffffff", primary: "#dd2a8f", accent: "#8a4fe0" },
    swatches: ["#dd2a8f", "#ff5cb3", "#8a4fe0", "#b184f0", "#ffffff", "#f5f0fa", "#3ad6d0", "#1a0b2e", "#ffe14d"],
  },
  {
    id: "hip-hop",
    name: "Hip-Hop",
    description: "Urban, bold, street-smart",
    isPremium: false,
    dataTheme: "hip-hop",
    emoji: "🎧",
    mood: "Urban, bold, street-smart",
    preview: { bg: "#0a0a0c", primary: "#f0e9d8", accent: "#c99a34" },
    swatches: ["#0a0a0c", "#1a1a20", "#c99a34", "#e0bd6a", "#f0e9d8", "#4a2f70", "#7a3fb0", "#2d2d35", "#000000"],
  },
  {
    id: "electronic",
    name: "Electronic / EDM",
    description: "Futuristic, neon-lit, pulsing",
    isPremium: false,
    dataTheme: "electronic",
    emoji: "🎛️",
    mood: "Futuristic, neon-lit, pulsing",
    preview: { bg: "#0a0820", primary: "#f0f0ff", accent: "#25d9f0" },
    swatches: ["#0a0820", "#1a1440", "#25d9f0", "#8fefff", "#ff2ec4", "#ff8fe0", "#f0f0ff", "#3d2d80", "#050414"],
  },
  {
    id: "jazz",
    name: "Jazz",
    description: "Moody, smoky, late-night sophistication",
    isPremium: false,
    dataTheme: "jazz",
    emoji: "🎷",
    mood: "Moody, smoky, late-night sophistication",
    preview: { bg: "#2a0f18", primary: "#f0e4d4", accent: "#c99248" },
    swatches: ["#2a0f18", "#421827", "#c99248", "#e0b878", "#f0e4d4", "#8a4a5a", "#5c1f2e", "#1a0810", "#3d2410"],
  },
  {
    id: "classical",
    name: "Classical",
    description: "Elegant, timeless, grand",
    isPremium: false,
    dataTheme: "classical",
    emoji: "🎻",
    mood: "Elegant, timeless, grand",
    preview: { bg: "#f8f0e0", primary: "#5c1830", accent: "#bb9440" },
    swatches: ["#5c1830", "#7a2440", "#bb9440", "#d4b878", "#f8f0e0", "#ecdcc0", "#8a6a3a", "#3a0f1c", "#2c1320"],
  },
  {
    id: "rnb",
    name: "R&B / Soul",
    description: "Warm, sultry, soulful",
    isPremium: false,
    dataTheme: "rnb",
    emoji: "🎙️",
    mood: "Warm, sultry, soulful",
    preview: { bg: "#2e1030", primary: "#f0dfd0", accent: "#e0906a" },
    swatches: ["#2e1030", "#48184c", "#e0906a", "#f0b894", "#f0dfd0", "#a05470", "#6a2450", "#1a0a1c", "#3a2018"],
  },
];

export const ALL_THEMES = [...BASE_THEMES, ...STYLE_PALETTES, ...MUSIC_GENRE_PALETTES];

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return ALL_THEMES.find((t) => t.id === id) ?? BASE_THEMES[0];
}

/** Returns the hex accent colour for a given theme — used to drive inline styles across the author site. */
export function getThemeAccentHex(siteTheme: string | null | undefined): string {
  return getTheme(siteTheme).preview.accent;
}

/**
 * Resolves the effective accent colour for an author across the public site.
 * PREMIUM authors may override the theme accent with a custom hex colour;
 * everyone else (and Premium authors who haven't set one) gets the theme accent.
 */
export function resolveAccentColor(opts: {
  planTier:          string | null | undefined;
  customAccentColor: string | null | undefined;
  siteTheme:         string | null | undefined;
}): string {
  if (opts.planTier === "PREMIUM" && opts.customAccentColor) {
    return opts.customAccentColor;
  }
  return getThemeAccentHex(opts.siteTheme);
}

/**
 * Resolves the Premium "secondary/highlight" colour override for the hero
 * banner two-tone treatment. Returns null when not set (or not Premium) —
 * callers should fall back to accent-only styling with no visual change.
 */
export function resolveSecondaryColor(opts: {
  planTier:             string | null | undefined;
  customSecondaryColor: string | null | undefined;
}): string | null {
  if (opts.planTier === "PREMIUM" && opts.customSecondaryColor) {
    return opts.customSecondaryColor;
  }
  return null;
}

/**
 * Which themes are available per plan tier.
 * FREE     → all 3 base colour themes (Classic Literary, Modern Minimal, Dark Elegant)
 * STANDARD → base themes + all genre/style palettes (STYLE_PALETTES)
 * PREMIUM  → everything, plus Cinematic layout template + custom accent/secondary colours
 */
export const BASE_THEME_IDS = BASE_THEMES.map((t) => t.id);
export const STYLE_PALETTE_IDS = STYLE_PALETTES.map((t) => t.id);

export function isThemeAllowed(themeId: string, planTier: string): boolean {
  if (planTier === "PREMIUM" || planTier === "STANDARD") return true;
  // FREE — the 3 base colour themes only (no genre/style palettes)
  return (BASE_THEME_IDS as string[]).includes(themeId);
}

/** The default theme for each plan tier (used on downgrade). */
export function getDefaultThemeForPlan(planTier: string): string {
  if (planTier === "FREE") return "modern-minimal";
  return "classic-literary"; // STANDARD and PREMIUM default
}
