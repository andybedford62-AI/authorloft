import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { SpecialForm } from "@/components/admin/special-form";
import { getAdminAuthorId } from "@/lib/admin-auth";

type Props = { params: Promise<{ id: string }> };

export default async function EditSpecialPage({ params }: Props) {
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const special = await prisma.special.findFirst({
    where: { id, authorId },
    include: { discountCode: { select: { id: true } } },
  });
  if (!special) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/specials"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Specials
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{special.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Special</h1>
        <p className="text-sm text-gray-500 mt-1">Update the details for this promotion.</p>
      </div>

      <SpecialForm
        mode="edit"
        initial={{
          id:          special.id,
          title:       special.title,
          description: special.description,
          imageUrl:    special.imageUrl,
          ctaLabel:    special.ctaLabel,
          ctaUrl:      special.ctaUrl,
          startsAt:       special.startsAt?.toISOString() ?? null,
          endsAt:         special.endsAt?.toISOString() ?? null,
          isActive:       special.isActive,
          discountCodeId: special.discountCode?.id ?? null,
        }}
      />
    </div>
  );
}
