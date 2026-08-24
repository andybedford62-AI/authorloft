import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { MusicListForm } from "@/components/admin/music-list-form";

export const dynamic = "force-dynamic";

export default async function EditMusicListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authorId = await getAdminAuthorId();

  const list = await prisma.course.findFirst({
    where: { id, authorId, kind: "MUSIC" },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!list) notFound();

  const trackCap = await maxTracksPerList(authorId);
  const tracks = list.modules.flatMap((m) =>
    m.lessons.map((l) => ({ url: l.videoUrl ?? "", title: l.title }))
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/music" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Music
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{list.title}</h1>
      </div>
      <MusicListForm
        listId={list.id}
        trackCap={trackCap}
        initial={{
          title: list.title,
          description: list.description ?? "",
          coverImageUrl: list.coverImageUrl ?? "",
          isPublished: list.isPublished,
          tracks: tracks.length > 0 ? tracks : [{ url: "", title: "" }],
        }}
      />
    </div>
  );
}
