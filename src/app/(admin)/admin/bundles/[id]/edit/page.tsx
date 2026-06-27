import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BundleForm } from "@/components/admin/bundle-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditBundlePage({ params }: Props) {
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const bundle = await prisma.bundle.findFirst({
    where: { id, authorId },
    include: {
      items: {
        include: { saleItem: { select: { id: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!bundle) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/bundles"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Bundles
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{bundle.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Bundle</h1>
        <p className="text-sm text-gray-500 mt-1">Update the details for this bundle.</p>
      </div>

      <BundleForm
        mode="edit"
        initial={{
          id: bundle.id,
          title: bundle.title,
          description: bundle.description,
          coverImageUrl: bundle.coverImageUrl,
          priceCents: bundle.priceCents,
          isPublished: bundle.isPublished,
          saleItemIds: bundle.items.map((i) => i.saleItem.id),
        }}
      />
    </div>
  );
}
