import Link from "next/link";
import { Package } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { Button } from "@/components/ui/button";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  return {
    title: "Bundles",
    description: `Save with book bundles from ${authorName} — get multiple titles at a discounted price.`,
  };
}

export default async function BundlesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const bundles = await prisma.bundle.findMany({
    where: { authorId: author.id, isPublished: true },
    include: {
      items: {
        include: {
          saleItem: {
            include: { book: { select: { title: true, coverImageUrl: true } } },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageBanner
        label="Save More"
        title="Bundles"
        subtitle={`Get multiple books together at a discounted price from ${author.displayName || author.name}.`}
        accentColor={accentColor}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {bundles.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-500">No bundles available</h2>
            <p className="text-gray-400 mt-2 mb-8 max-w-sm mx-auto">
              Check back soon — bundles with discounted pricing may appear here.
            </p>
            <Link href="/books">
              <Button variant="outline">Browse Individual Titles</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const itemTotal = bundle.items.reduce((s, i) => s + i.saleItem.priceCents, 0);
              const savings = itemTotal > 0 && bundle.priceCents < itemTotal
                ? Math.round(((itemTotal - bundle.priceCents) / itemTotal) * 100)
                : 0;

              return (
                <Link
                  key={bundle.id}
                  href={`/bundles/${bundle.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                  {/* Stacked covers */}
                  <div className="relative h-48 bg-gray-50 flex items-center justify-center gap-2 p-4">
                    {bundle.items.slice(0, 4).map((item, i) => (
                      <div
                        key={item.saleItemId}
                        className="w-20 h-28 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white flex-shrink-0"
                        style={{ transform: `rotate(${(i - 1.5) * 3}deg)` }}
                      >
                        {item.saleItem.book.coverImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.saleItem.book.coverImageUrl}
                            alt={item.saleItem.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                      {bundle.title}
                    </h2>
                    {bundle.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{bundle.description}</p>
                    )}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCents(bundle.priceCents)}
                        </span>
                        {savings > 0 && (
                          <span className="ml-2 text-sm text-green-600 font-medium">
                            Save {savings}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {bundle.items.length} item{bundle.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
