import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { MusicListForm } from "@/components/admin/music-list-form";
import { MusicShareKit } from "@/components/admin/music-share-kit";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { releaseLabel } from "@/lib/music-share";

export const dynamic = "force-dynamic";

export default async function EditMusicListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authorId = await getAdminAuthorId();

  const [list, author] = await Promise.all([
    prisma.course.findFirst({
      where: { id, authorId, kind: "MUSIC" },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
    prisma.author.findUnique({
      where: { id: authorId },
      select: { slug: true, customDomain: true, name: true, displayName: true, plan: { select: { tier: true } } },
    }),
  ]);
  if (!list) notFound();
  const bookstoreEnabled = (author?.plan?.tier ?? "FREE") !== "FREE";

  const trackCap = await maxTracksPerList(authorId);
  const tracks = list.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      url: l.videoUrl ?? "",
      title: l.title,
      // Edited as plain text; the original markup is echoed back so a note
      // containing an image survives a save that didn't change the wording.
      description: (l.contentHtml ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      originalHtml: l.contentHtml ?? "",
      thumbnailUrl: l.thumbnailUrl,
    }))
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/music" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Music
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{list.title}</h1>
      </div>
      {author && (
        <MusicShareKit
          url={`${getAuthorBaseUrl(author)}/music/${list.slug}`}
          slug={list.slug}
          title={list.title}
          artistName={author.displayName || author.name}
          releaseLabel={releaseLabel(list.releaseType)}
          isPublished={list.isPublished}
        />
      )}
      <MusicListForm
        listId={list.id}
        trackCap={trackCap}
        bookstoreEnabled={bookstoreEnabled}
        initial={{
          title: list.title,
          description: list.description ?? "",
          coverImageUrl: list.coverImageUrl ?? "",
          isPublished: list.isPublished,
          isFeatured: list.isFeatured,
          listInBookstore: list.listInBookstore,
          releaseType: list.releaseType ?? "PLAYLIST",
          tracks: tracks.length > 0 ? tracks : [{ url: "", title: "", description: "", originalHtml: "" }],
        }}
      />
    </div>
  );
}
