import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { MusicOrganizer } from "@/components/admin/music-organizer";

export const dynamic = "force-dynamic";

export default async function OrganizeMusicPage() {
  const authorId = await getAdminAuthorId();

  const [lists, trackCap] = await Promise.all([
    prisma.course.findMany({
      where: { authorId, kind: "MUSIC" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        releaseType: true,
        isPublished: true,
        modules: {
          orderBy: { sortOrder: "asc" },
          select: {
            lessons: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, title: true, thumbnailUrl: true },
            },
          },
        },
      },
    }),
    maxTracksPerList(authorId),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/music" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Music
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Organize tracks</h1>
      </div>
      {lists.length < 2 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          You need at least two music lists or albums to move tracks between them.
        </div>
      ) : (
        <MusicOrganizer
          trackCap={trackCap}
          initialLists={lists.map((l) => ({
            id: l.id,
            title: l.title,
            releaseType: l.releaseType,
            isPublished: l.isPublished,
            tracks: l.modules.flatMap((m) => m.lessons),
          }))}
        />
      )}
    </div>
  );
}
