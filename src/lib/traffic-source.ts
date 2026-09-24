// Turns the raw Traffic Sources value (a `utm_source` tag, a referring domain,
// or "Direct") into what the author sees. Tagged links come from taggedUrl() in
// music-share.ts — the share kit, share bar, Social Promote and the QR code —
// so every tag it can write should have a label here.

const TAG_LABELS: Record<string, string> = {
  instagram:     "Instagram",
  tiktok:        "TikTok",
  facebook:      "Facebook",
  x:             "X",
  twitter:       "X",
  threads:       "Threads",
  whatsapp:      "WhatsApp",
  reddit:        "Reddit",
  linkedin:      "LinkedIn",
  youtube:       "YouTube",
  newsletter:    "Newsletter / email",
  email:         "Email",
  caption:       "Share caption",
  qr:            "QR code",
  // A visitor sharing the page on (device share sheet or copied link).
  "share-sheet": "Shared link",
  "copy-link":   "Shared link",
};

export function trafficSourceLabel(raw: string): string {
  // Referring domains (and "Direct") pass through untouched; tags never contain a dot.
  if (raw === "Direct" || raw.includes(".")) return raw;
  const key = raw.trim().toLowerCase();
  if (TAG_LABELS[key]) return TAG_LABELS[key];
  return key.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Labels each row and merges rows that land on the same label, busiest first. */
export function labelTrafficSources(
  rows: { source: string; views: number }[],
  limit = 10
): { source: string; views: number }[] {
  const merged = new Map<string, number>();
  for (const { source, views } of rows) {
    const label = trafficSourceLabel(source);
    merged.set(label, (merged.get(label) ?? 0) + views);
  }
  return [...merged]
    .map(([source, views]) => ({ source, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
