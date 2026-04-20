import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { SpecialsListClient } from "@/components/admin/specials-list-client";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function AdminSpecialsPage() {
  const authorId = await getAdminAuthorId();

  const specials = await prisma.special.findMany({
    where: { authorId },
    orderBy: [{ createdAt: "desc" }],
  });

  const now = new Date();
  const activeCount  = specials.filter((s) => s.isActive && (!s.endsAt || s.endsAt > now)).length;
  const expiredCount = specials.filter((s) => s.endsAt && s.endsAt <= now).length;

  // Serialise Date fields so they can cross the server→client boundary
  const serialised = specials.map((s) => ({
    id:          s.id,
    title:       s.title,
    description: s.description,
    imageUrl:    s.imageUrl,
    ctaLabel:    s.ctaLabel,
    ctaUrl:      s.ctaUrl,
    startsAt:    s.startsAt ? s.startsAt.toISOString() : null,
    endsAt:      s.endsAt   ? s.endsAt.toISOString()   : null,
    isActive:    s.isActive,
  }));

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specials</h1>
          <p className="text-sm text-gray-500 mt-1">
            {specials.length} total &mdash; {activeCount} active
            {expiredCount > 0 && `, ${expiredCount} expired`}
          </p>
        </div>
        <Link
          href="/admin/specials/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Special
        </Link>
      </div>

      {/* List (handles its own empty state) */}
      <SpecialsListClient specials={serialised} />
    </div>
  );
}
