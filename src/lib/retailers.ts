/**
 * Predefined retailer definitions.
 * Used in both the admin form and the public-facing book card.
 */

export const RETAILERS = {
  amazon: {
    label:        "Buy on Amazon",
    shortLabel:   "Amazon",
    color:        "#E47911",
    badgeBg:      "#FFF8EE",
  },
  barnes_noble: {
    label:        "Buy on Barnes & Noble",
    shortLabel:   "Barnes & Noble",
    color:        "#1D5A2A",
    badgeBg:      "#EAF4EC",
  },
  goodreads: {
    label:        "View on Goodreads",
    shortLabel:   "Goodreads",
    color:        "#553B08",
    badgeBg:      "#FEF9EE",
  },
  kobo: {
    label:        "Buy on Kobo",
    shortLabel:   "Kobo",
    color:        "#D12228",
    badgeBg:      "#FEF0F0",
  },
  apple_books: {
    label:        "Buy on Apple Books",
    shortLabel:   "Apple Books",
    color:        "#FC3C58",
    badgeBg:      "#FEF0F3",
  },
  google_play: {
    label:        "Buy on Google Play",
    shortLabel:   "Google Play",
    color:        "#4285F4",
    badgeBg:      "#EEF4FE",
  },
  audible: {
    label:        "Listen on Audible",
    shortLabel:   "Audible",
    color:        "#F18A40",
    badgeBg:      "#FEF5EE",
  },
  smashwords: {
    label:        "Buy on Smashwords",
    shortLabel:   "Smashwords",
    color:        "#5C6BC0",
    badgeBg:      "#EEEFFE",
  },
  bookshop: {
    label:        "Buy on Bookshop.org",
    shortLabel:   "Bookshop.org",
    color:        "#2B7BB9",
    badgeBg:      "#EEF5FC",
  },
  draft2digital: {
    label:        "Buy on Draft2Digital",
    shortLabel:   "Draft2Digital",
    color:        "#007BFF",
    badgeBg:      "#EEF5FF",
  },
  scribd: {
    label:        "Read on Scribd",
    shortLabel:   "Scribd",
    color:        "#1E7B45",
    badgeBg:      "#EBF5EF",
  },
  custom: {
    label:        "Buy Now",
    shortLabel:   "Custom",
    color:        "#6B7280",
    badgeBg:      "#F3F4F6",
  },
} as const;

export type RetailerKey = keyof typeof RETAILERS;

export const RETAILER_KEYS = Object.keys(RETAILERS) as RetailerKey[];

/** Return display info for any retailer key, falling back to the custom style */
export function getRetailer(key: string) {
  return RETAILERS[key as RetailerKey] ?? RETAILERS.custom;
}
