import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOgImage } from "@/lib/seo-config";
import { COMPARISONS, COMPARISON_SLUGS } from "@/lib/comparison-data";
import { ComparisonPage } from "@/components/marketing/comparison-page";

export const revalidate = 3600;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export function generateStaticParams() {
  return COMPARISON_SLUGS.map((competitor) => ({ competitor }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = COMPARISONS[competitor];
  if (!data) return {};
  const ogImage = await getOgImage("home");
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `${BASE}/compare/${competitor}` },
    openGraph: {
      type: "website",
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${BASE}/compare/${competitor}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `AuthorLoft vs ${data.name}` }],
    },
    twitter: { card: "summary_large_image", title: data.metaTitle, description: data.metaDescription, images: [ogImage] },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const data = COMPARISONS[competitor];
  if (!data) notFound();
  return <ComparisonPage data={data} />;
}
