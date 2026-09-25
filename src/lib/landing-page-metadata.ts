import type { Metadata } from "next";
import { LANDING_PAGES } from "@/lib/landing-page-data";
import { DEFAULT_OG_IMAGE, getOgImage, type SeoPageId } from "@/lib/seo-config";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

/**
 * Metadata for every solution landing page. Share image priority:
 * Super Admin → Platform Settings → Social Images upload, then the page's own
 * `ogImage`, then the site default. (Until Sept 25 2026 these pages hard-coded
 * the default, so uploads made in that tab were silently ignored.)
 */
export async function landingPageMetadata(slug: string): Promise<Metadata> {
  const data = LANDING_PAGES[slug];
  const uploaded = await getOgImage(slug as SeoPageId);
  const ogImage = uploaded !== DEFAULT_OG_IMAGE ? uploaded : (data.ogImage ?? DEFAULT_OG_IMAGE);
  const title = `${data.metaTitle} | AuthorLoft`;
  const url = `${BASE}/${data.slug}`;
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description: data.metaDescription,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.backgroundImageAlt ?? data.eyebrow }],
    },
    twitter: { card: "summary_large_image", title, description: data.metaDescription, images: [ogImage] },
  };
}
