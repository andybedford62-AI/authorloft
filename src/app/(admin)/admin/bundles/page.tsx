import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { NavVisibilityBanner } from "@/components/admin/nav-visibility-banner";
import { formatCents } from "@/lib/utils";

export default async function AdminBundlesPage() {
  const authorId = await getAdminAuthorId();

  const bundles = await prisma.bundle.findMany({
    where: { authorId },
    include: {
      items: {
        include: {
          saleItem: {
            include: { book: { select: { title: true, coverImageUrl: true } } },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { orderItems: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <NavVisibilityBanner authorId={authorId} navKey="bundles" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bundles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {bundles.length} bundle{bundles.length !== 1 ? "s" : ""} &mdash;{" "}
            {bundles.filter((b) => b.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/bundles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Bundle
          </Button>
        </Link>
      </div>

      {/* List */}
      {bundles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Package multiple book formats together and offer them at a discounted price.
          </p>
          <Link href="/admin/bundles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bundle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((bundle) => {
            const itemTotal = bundle.items.reduce((s, i) => s + i.saleItem.priceCents, 0);
            const savings = itemTotal > 0 && bundle.priceCents < itemTotal
              ? Math.round(((itemTotal - bundle.priceCents) / itemTotal) * 100)
              : 0;

            return (
              <Link
                key={bundle.id}
                href={`/admin/bundles/${bundle.id}/edit`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                {/* Cover thumbnails */}
                <div className="flex -space-x-3 flex-shrink-0">
                  {bundle.items.slice(0, 3).map((item, i) => (
                    <div
                      key={item.saleItemId}
                      className="w-12 h-16 rounded-md overflow-hidden border-2 border-white bg-gray-100"
                      style={{ zIndex: 3 - i }}
                    >
                      {item.saleItem.book.coverImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.saleItem.book.coverImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {bundle.items.length > 3 && (
                    <div className="w-12 h-16 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                      +{bundle.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {bundle.title}
                    </h3>
                    <Badge variant={bundle.isPublished ? "success" : "outline"}>
                      {bundle.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {bundle.items.length} item{bundle.items.length !== 1 ? "s" : ""}
                    {bundle._count.orderItems > 0 && ` · ${bundle._count.orderItems} sold`}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCents(bundle.priceCents)}
                  </p>
                  {savings > 0 && (
                    <p className="text-xs text-green-600">{savings}% off</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
