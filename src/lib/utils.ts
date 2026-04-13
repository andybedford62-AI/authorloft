import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateDownloadToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Curated accent color palette for author branding
export const ACCENT_COLORS = [
  { name: "Crimson",     value: "#7B2D2D" },
  { name: "Ocean",       value: "#2563EB" },
  { name: "Navy",        value: "#1E3A5F" },
  { name: "Sapphire",    value: "#1D4ED8" },
  { name: "Forest",      value: "#2D5A3D" },
  { name: "Slate",       value: "#4A5568" },
  { name: "Plum",        value: "#5B2D7B" },
  { name: "Amber",       value: "#92400E" },
  { name: "Teal",        value: "#0F766E" },
  { name: "Charcoal",    value: "#2D3748" },
  { name: "Burgundy",    value: "#6B1F2A" },
  { name: "Midnight",    value: "#1A1F3A" },
];

export function getAuthorSiteUrl(slug: string): string {
  const domain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  if (process.env.NODE_ENV === "development") {
    return `http://${slug}.localhost:3000`;
  }
  return `https://${slug}.${domain}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "…";
}
