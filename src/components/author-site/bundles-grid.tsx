import Link from "next/link";
import { Package } from "lucide-react";
import { formatCents } from "@/lib/utils";

export interface BundleForGrid {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  priceCents: number;
  items: {
    saleItemId: string;
    saleItem: {
      priceCents: number;
      book: { title: string; coverImageUrl: string | null };
    };
  }[];
}

// Extracted from the standalone /bundles page so it can also render inside
// the Books|Bundles tab switcher — same markup, no behavior change.
export function BundlesGrid({ bundles }: { bundles: BundleForGrid[] }) {
  if (bundles.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="h-10 w-10 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-500">No bundles available</h2>
        <p className="text-gray-400 mt-2 max-w-sm mx-auto">
          Check back soon — bundles with discounted pricing may appear here.
        </p>
      </div>
    );
  }

  return (
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
  );
}
