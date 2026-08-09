import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, BookOpen, ArrowLeft } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/utils";
import { BundleBuyButton } from "./bundle-buy-button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const bundle = await prisma.bundle.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    select: { title: true, description: true, coverImageUrl: true },
  });
  if (!bundle) return {};

  return {
    title: bundle.title,
    description: bundle.description || `Get the ${bundle.title} bundle at a discounted price.`,
    openGraph: {
      title: bundle.title,
      description: bundle.description || undefined,
      images: bundle.coverImageUrl ? [{ url: bundle.coverImageUrl }] : undefined,
    },
  };
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const bundle = await prisma.bundle.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    include: {
      items: {
        include: {
          saleItem: {
            include: {
              book: {
                select: { title: true, slug: true, coverImageUrl: true, subtitle: true },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!bundle) notFound();

  const itemTotal = bundle.items.reduce((s, i) => s + i.saleItem.priceCents, 0);
  const savings = itemTotal > 0 && bundle.priceCents < itemTotal
    ? Math.round(((itemTotal - bundle.priceCents) / itemTotal) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <Link
        href="/bundles"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Bundles
      </Link>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Left: covers */}
        <div className="md:col-span-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {bundle.title}
          </h1>
          {bundle.description && (
            <p className="text-gray-600 leading-relaxed mb-8">{bundle.description}</p>
          )}

          {/* Included items */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            What&apos;s Included ({bundle.items.length} items)
          </h2>
          <div className="space-y-3">
            {bundle.items.map((item) => (
              <Link
                key={item.saleItemId}
                href={`/books/${item.saleItem.book.slug}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group bg-white"
              >
                {item.saleItem.book.coverImageUrl ? (
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.saleItem.book.coverImageUrl}
                      alt={item.saleItem.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.saleItem.book.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.saleItem.label} · {item.saleItem.format}
                  </p>
                </div>
                <div className="text-sm text-gray-400 flex-shrink-0">
                  {formatCents(item.saleItem.priceCents)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: buy card */}
        <div className="md:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Price */}
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {formatCents(bundle.priceCents)}
              </p>
              {savings > 0 && (
                <div className="mt-1">
                  <span className="text-sm text-gray-400 line-through">
                    {formatCents(itemTotal)}
                  </span>
                  <span
                    className="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    Save {savings}%
                  </span>
                </div>
              )}
            </div>

            {/* Buy button */}
            <BundleBuyButton
              bundleId={bundle.id}
              priceCents={bundle.priceCents}
              accentColor={accentColor}
            />

            {/* Summary */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{bundle.items.length} items included</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">You save</span>
                  <span className="font-semibold text-green-600">
                    {formatCents(itemTotal - bundle.priceCents)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
