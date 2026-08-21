import type { Metadata } from "next";
import { LANDING_PAGES } from "@/lib/landing-page-data";
import { LandingPage } from "@/components/marketing/landing-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo-config";

const data = LANDING_PAGES["author-website-builder"];
const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: `${BASE}/${data.slug}` },
  openGraph: {
    type: "website",
    title: `${data.metaTitle} | AuthorLoft`,
    description: data.metaDescription,
    url: `${BASE}/${data.slug}`,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: data.eyebrow }],
  },
  twitter: { card: "summary_large_image", title: `${data.metaTitle} | AuthorLoft`, description: data.metaDescription, images: [DEFAULT_OG_IMAGE] },
};

export default function Page() {
  return <LandingPage data={data} />;
}
