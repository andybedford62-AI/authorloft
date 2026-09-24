// Share links for anything with a public page — books, courses and music.
// Used by the public ShareBar, the admin ShareKit and Social Promote, so the
// tagged URLs (and so the Traffic Sources labels in lib/traffic-source.ts)
// are built one way everywhere.

/** Adds UTM tags so PostHog attributes the visit to the network it came from. */
export function taggedUrl(url: string, source: string, campaign: string, medium = "social"): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

export type ShareNetwork = "facebook" | "x" | "threads" | "whatsapp" | "reddit" | "linkedin" | "email";

/** Web share-intent URLs. TikTok and Instagram have none — they're reached
 *  through the device share sheet or a copied link. */
export function shareIntentUrl(network: ShareNetwork, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (network) {
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "x":        return `https://x.com/intent/post?text=${t}&url=${u}`;
    case "threads":  return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "whatsapp": return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "reddit":   return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    case "linkedin": return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "email":    return `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  }
}
