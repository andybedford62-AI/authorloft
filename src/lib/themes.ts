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
  | "western";

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

// ── Genre Palettes (Premium only) ───────────────────────────────────────────

export const GENRE_PALETTES: ThemeDefinition[] = [
  {
    id: "thriller",
    name: "Thriller / Suspense",
    description: "High-contrast, tense, cinematic",
    isPremium: true,
    dataTheme: "thriller",
    emoji: "🎬",
    mood: "High-contrast, tense, cinematic",
    preview: { bg: "#e5e5e5", primary: "#0b1220", accent: "#c0392b" },
    swatches: ["#0b1220", "#1a3550", "#c0392b", "#e74c3c", "#e5e5e5", "#bdc3c7", "#95a5a6", "#7f8c8d", "#2c3e50"],
  },
  {
    id: "fantasy",
    name: "Epic Fantasy",
    description: "Mythic, luminous, magical",
    isPremium: true,
    dataTheme: "fantasy",
    emoji: "✨",
    mood: "Mythic, luminous, magical",
    preview: { bg: "#f5f0e8", primary: "#2d1b5e", accent: "#d4a843" },
    swatches: ["#2d1b5e", "#6b35a8", "#d4a843", "#f0c060", "#f5f0e8", "#e8dcc8", "#9b7fd4", "#4a2080", "#1a0d38"],
  },
  {
    id: "romance",
    name: "Romance",
    description: "Warm, soft, emotional",
    isPremium: true,
    dataTheme: "romance",
    emoji: "💕",
    mood: "Warm, soft, emotional",
    preview: { bg: "#fff8f6", primary: "#7a2040", accent: "#f4a8b8" },
    swatches: ["#7a2040", "#b84c6e", "#f4a8b8", "#ffd4a8", "#fff8f6", "#ffe4e0", "#e87090", "#c0385a", "#4a1028"],
  },
  {
    id: "scifi",
    name: "Science Fiction",
    description: "Neon, sleek, futuristic",
    isPremium: true,
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
    isPremium: true,
    dataTheme: "nautical",
    emoji: "🌊",
    mood: "Pressure, depth, cold metallic",
    preview: { bg: "#eef4f8", primary: "#001f3f", accent: "#ff9500" },
    swatches: ["#001f3f", "#003366", "#ff9500", "#ffb84d", "#eef4f8", "#c8dce8", "#4a7fa0", "#1a4060", "#002850"],
  },
  {
    id: "childrens",
    name: "Children's Books",
    description: "Bright, friendly, playful",
    isPremium: true,
    dataTheme: "childrens",
    emoji: "🌈",
    mood: "Bright, friendly, playful",
    preview: { bg: "#ffffff", primary: "#1a5c5a", accent: "#ffd93d" },
    swatches: ["#1a5c5a", "#2eada8", "#ffd93d", "#ff6b6b", "#ffffff", "#f0fafa", "#4ecdc4", "#ffe66d", "#ff8e53"],
  },
  {
    id: "literary",
    name: "Literary Fiction",
    description: "Minimalist, elegant, muted",
    isPremium: true,
    dataTheme: "literary",
    emoji: "📖",
    mood: "Minimalist, elegant, muted",
    preview: { bg: "#fafafa", primary: "#1a1a1a", accent: "#8b6f5e" },
    swatches: ["#1a1a1a", "#2c2c2c", "#8b6f5e", "#a88070", "#fafafa", "#f0f0f0", "#d4c4bc", "#6a5048", "#3a2820"],
  },
  {
    id: "western",
    name: "Country / Western",
    description: "Rustic, warm, earthy",
    isPremium: true,
    dataTheme: "western",
    emoji: "🤠",
    mood: "Rustic, warm, earthy",
    preview: { bg: "#f5ede0", primary: "#3d1f0d", accent: "#c07830" },
    swatches: ["#3d1f0d", "#6b3518", "#c07830", "#d4944a", "#f5ede0", "#e8d4b8", "#a06028", "#804818", "#2a1008"],
  },
];

export const ALL_THEMES = [...BASE_THEMES, ...GENRE_PALETTES];

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return ALL_THEMES.find((t) => t.id === id) ?? BASE_THEMES[0];
}
