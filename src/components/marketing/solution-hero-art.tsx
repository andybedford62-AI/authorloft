import type { ReactNode } from "react";

/**
 * Abstract line-art hero illustrations for the 12 solution pages — one per
 * `LandingPageData.slug`, used as `MarketingPageHeader`'s `heroArt` prop.
 *
 * Exists because those 12 pages had no banner art at all (flagged and parked
 * previously — AI-generated photorealistic scenes came out too similar across
 * pages to read as distinct, which is a structural problem with that approach,
 * not a prompting one). Abstract geometric icon-scenes sidestep it: every
 * page gets a shape that's actually about its own topic, they all share one
 * consistent visual language (same backdrop, stroke weight, token palette),
 * and nothing needed to be sourced or generated externally.
 *
 * Each icon sits inside `ArtFrame`, a shared backdrop (soft ring + concentric
 * circle + dot grid) so the 12 read as one family, not 12 unrelated doodles.
 * Colors are the real Vault tokens via fill-vault and stroke-vault utility
 * classes — no hardcoded hex, consistent with the rest of the identity.
 */

function ArtFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto" role="img" aria-hidden focusable="false">
      <circle cx="120" cy="120" r="118" className="fill-vault-surf-2/60" />
      <circle cx="120" cy="120" r="92" className="stroke-vault-gold/25" strokeWidth="1" fill="none" />
      <circle cx="120" cy="120" r="118" className="stroke-vault-ink/10" strokeWidth="1" fill="none" />
      {[36, 72, 108, 144, 180, 204].map((y) =>
        [36, 72, 108, 144, 180, 204].map((x) => {
          const d = Math.hypot(x - 120, y - 120);
          if (d > 108) return null;
          return <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" className="fill-vault-ink/10" />;
        })
      )}
      {children}
    </svg>
  );
}

const STROKE = "stroke-vault-gold";
const STROKE_MUTE = "stroke-vault-mute/70";
const FILL_GOLD = "fill-vault-gold";
const FILL_INK = "fill-vault-ink";

function WebsiteBuilderArt() {
  return (
    <ArtFrame>
      <rect x="62" y="70" width="116" height="90" rx="8" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <rect x="62" y="70" width="116" height="20" rx="8" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <circle cx="72" cy="80" r="2.4" className={FILL_GOLD} />
      <circle cx="80" cy="80" r="2.4" className="fill-vault-mute" />
      <circle cx="88" cy="80" r="2.4" className="fill-vault-mute" />
      <rect x="74" y="102" width="68" height="8" rx="2" className={FILL_GOLD} opacity="0.85" />
      <rect x="74" y="118" width="92" height="5" rx="2" className="fill-vault-mute" opacity="0.6" />
      <rect x="74" y="130" width="80" height="5" rx="2" className="fill-vault-mute" opacity="0.6" />
      <rect x="74" y="144" width="34" height="10" rx="5" className={`${STROKE} fill-none`} strokeWidth="2" />
    </ArtFrame>
  );
}

function SellDirectArt() {
  return (
    <ArtFrame>
      <rect x="72" y="60" width="56" height="76" rx="4" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <line x1="82" y1="76" x2="118" y2="76" className={STROKE_MUTE} strokeWidth="2" />
      <line x1="82" y1="88" x2="112" y2="88" className={STROKE_MUTE} strokeWidth="2" />
      <line x1="82" y1="100" x2="108" y2="100" className={STROKE_MUTE} strokeWidth="2" />
      <circle cx="152" cy="130" r="26" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <path d="M152 118v24M144 124c0-4 4-6 8-6s8 2 8 6-4 6-8 6-8 2-8 6 4 6 8 6 8-2 8-6" className={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M118 100l18 18" className={`${STROKE} `} strokeWidth="2" strokeLinecap="round" />
    </ArtFrame>
  );
}

function MarketingArt() {
  return (
    <ArtFrame>
      <path d="M70 118v-10a10 10 0 0110-10h8l38-20v80l-38-20h-8a10 10 0 01-10-10z" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M126 78l0 80" className="stroke-vault-mute/0" />
      <path d="M92 118v18a6 6 0 006 6h4a6 6 0 006-6v-12" className={STROKE_MUTE} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M140 96c8 6 8 26 0 32" className={`${STROKE}`} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M154 86c14 10 14 42 0 52" className="stroke-vault-gold/50" strokeWidth="2" fill="none" strokeLinecap="round" />
    </ArtFrame>
  );
}

function NewsletterArt() {
  return (
    <ArtFrame>
      <rect x="60" y="88" width="120" height="76" rx="6" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <path d="M62 92l58 42 58-42" className={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="168" cy="76" r="18" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <path d="M160 76a8 8 0 118 8" className={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="76" r="2" className={FILL_GOLD} />
    </ArtFrame>
  );
}

function ArcArt() {
  return (
    <ArtFrame>
      <rect x="76" y="66" width="60" height="80" rx="4" className={`${STROKE_MUTE} fill-vault-surf-2`} strokeWidth="2" transform="rotate(-8 106 106)" />
      <rect x="92" y="74" width="60" height="80" rx="4" className={`${STROKE} fill-vault-bg`} strokeWidth="2" transform="rotate(4 122 114)" />
      <circle cx="150" cy="150" r="20" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <path d="M142 150l6 6 12-12" className={STROKE} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </ArtFrame>
  );
}

function MediaKitArt() {
  return (
    <ArtFrame>
      <path d="M64 96a6 6 0 016-6h30l8 10h68a6 6 0 016 6v54a6 6 0 01-6 6H70a6 6 0 01-6-6z" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="120" cy="128" r="20" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <circle cx="120" cy="128" r="9" className={`${STROKE} fill-none`} strokeWidth="2" />
      <circle cx="136" cy="115" r="3" className={FILL_GOLD} />
    </ArtFrame>
  );
}

function AiToolsArt() {
  return (
    <ArtFrame>
      <path d="M120 62l7 21 21 7-21 7-7 21-7-21-21-7 21-7z" className={`${FILL_GOLD}`} opacity="0.9" />
      <path d="M166 118l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" className="fill-vault-ink" opacity="0.55" />
      <path d="M76 140l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" className="fill-vault-mute" opacity="0.5" />
      <path d="M92 176c10-18 46-18 56 0" className={STROKE_MUTE} strokeWidth="2" fill="none" strokeLinecap="round" />
    </ArtFrame>
  );
}

function BookstoreArt() {
  return (
    <ArtFrame>
      <path d="M64 160l6-56h100l6 56z" className={`${STROKE_MUTE} fill-vault-surf-2`} strokeWidth="2" strokeLinejoin="round" />
      <line x1="70" y1="104" x2="170" y2="104" className={STROKE_MUTE} strokeWidth="2" />
      {[80, 100, 120, 140, 160].map((x, i) => (
        <rect key={x} x={x - 6} y={104 - 6 - (i % 2 === 0 ? 22 : 30)} width="12" height={6 + (i % 2 === 0 ? 22 : 30)} rx="1.5" className={i % 3 === 0 ? FILL_GOLD : "fill-vault-mute"} opacity={i % 3 === 0 ? 0.9 : 0.55} />
      ))}
    </ArtFrame>
  );
}

function PreOrdersArt() {
  return (
    <ArtFrame>
      <rect x="66" y="72" width="108" height="90" rx="6" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <line x1="66" y1="94" x2="174" y2="94" className={STROKE} strokeWidth="2" />
      <line x1="88" y1="62" x2="88" y2="82" className={STROKE} strokeWidth="3" strokeLinecap="round" />
      <line x1="152" y1="62" x2="152" y2="82" className={STROKE} strokeWidth="3" strokeLinecap="round" />
      {[[88, 112], [110, 112], [132, 112], [154, 112], [88, 132], [110, 132]].map(([x, y], i) => (
        <rect key={i} x={x - 5} y={y - 5} width="10" height="10" rx="2" className={i === 4 ? FILL_GOLD : "fill-vault-mute/40"} />
      ))}
    </ArtFrame>
  );
}

function AffiliateArt() {
  return (
    <ArtFrame>
      <circle cx="88" cy="96" r="14" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" />
      <circle cx="152" cy="96" r="14" className={`${STROKE_MUTE} fill-vault-surf-2`} strokeWidth="2" />
      <circle cx="120" cy="156" r="16" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <path d="M99 104l14 40M141 104l-14 40" className={STROKE_MUTE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="156" r="5" className={FILL_GOLD} />
    </ArtFrame>
  );
}

function AnalyticsArt() {
  return (
    <ArtFrame>
      <line x1="72" y1="168" x2="168" y2="168" className={STROKE_MUTE} strokeWidth="2" />
      <rect x="82" y="132" width="16" height="36" rx="2" className="fill-vault-mute/50" />
      <rect x="106" y="108" width="16" height="60" rx="2" className={FILL_GOLD} opacity="0.85" />
      <rect x="130" y="120" width="16" height="48" rx="2" className="fill-vault-mute/50" />
      <rect x="154" y="90" width="16" height="78" rx="2" className={FILL_GOLD} />
      <path d="M80 116l24-16 22 10 42-32" className={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </ArtFrame>
  );
}

function CoursesArt() {
  return (
    <ArtFrame>
      <path d="M64 100l56-24 56 24-56 24z" className={`${STROKE} fill-vault-surf-2`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M92 112v26c0 8 12 14 28 14s28-6 28-14v-26" className={STROKE_MUTE} strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="176" y1="100" x2="176" y2="128" className={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="176" cy="134" r="2.6" className={FILL_GOLD} />
      <circle cx="120" cy="160" r="16" className={`${STROKE} fill-vault-bg`} strokeWidth="2" />
      <path d="M116 152l10 8-10 8z" className={FILL_INK} />
    </ArtFrame>
  );
}

const HERO_ART: Record<string, ReactNode> = {
  "author-website-builder": <WebsiteBuilderArt />,
  "sell-books-directly": <SellDirectArt />,
  "book-marketing-platform": <MarketingArt />,
  "author-newsletter-platform": <NewsletterArt />,
  "arc-management": <ArcArt />,
  "author-media-kit": <MediaKitArt />,
  "ai-tools-for-authors": <AiToolsArt />,
  "indie-author-bookstore": <BookstoreArt />,
  "book-pre-orders": <PreOrdersArt />,
  "author-affiliate-program": <AffiliateArt />,
  "reader-analytics-for-authors": <AnalyticsArt />,
  "author-courses": <CoursesArt />,
};

export function getSolutionHeroArt(slug: string): ReactNode {
  return HERO_ART[slug] ?? null;
}
