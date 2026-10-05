import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { MusicListForm } from "@/components/admin/music-list-form";
import { ShareKit } from "@/components/admin/share-kit";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { releaseLabel, parseListenLinks } from "@/lib/music-share";
import { getTrackStats, PUBLIC_PLAYS_THRESHOLD } from "@/lib/music-stats";

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

  const [trackCap, trackStats] = await Promise.all([
    maxTracksPerList(authorId),
    getTrackStats(authorId, list.modules.flatMap((m) => m.lessons.map((l) => l.videoUrl))),
  ]);
  // Per song, so a link that appears twice in the list isn't counted twice.
  const totals = Object.values(trackStats).reduce(
    (t, s) => ({
      plays: t.plays + s.plays,
      listeners: t.listeners + s.listeners,
      likes: t.likes + s.likes,
      dislikes: t.dislikes + s.dislikes,
    }),
    { plays: 0, listeners: 0, likes: 0, dislikes: 0 }
  );
  const tracks = list.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      url: l.videoUrl ?? "",
      title: l.title,
      // Edited as plain text; the original markup is echoed back so a note
      // containing an image survives a save that didn't change the wording.
      description: (l.contentHtml ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      originalHtml: l.contentHtml ?? "",
      thumbnailUrl: l.thumbnailUrl,
      lessonId: l.id,
    }))
  );
  const otherLists = await prisma.course.findMany({
    where: { authorId, kind: "MUSIC", id: { not: id } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/music" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Music
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{list.title}</h1>
      </div>
      {author && (
        <ShareKit
          kind="music"
          itemId={list.id}
          url={`${getAuthorBaseUrl(author)}/music/${list.slug}`}
          slug={list.slug}
          title={list.title}
          creatorName={author.displayName || author.name}
          noun={releaseLabel(list.releaseType).toLowerCase()}
          isPublished={list.isPublished}
        />
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Play, label: "Plays", value: totals.plays, hint: "Every click" },
            { icon: Users, label: "Listeners", value: totals.listeners, hint: "One per person per day" },
            { icon: ThumbsUp, label: "Likes", value: totals.likes, hint: "Shown publicly" },
            { icon: ThumbsDown, label: "Dislikes", value: totals.dislikes, hint: "Only you see these" },
          ].map(({ icon: Icon, label, value, hint }) => (
            <div key={label}>
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Icon className="h-3.5 w-3.5" /> {label}
              </p>
              <p className="text-xl font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400">{hint}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Your public page shows a track&apos;s listener count once it reaches {PUBLIC_PLAYS_THRESHOLD}. Suno and
          other link-out tracks count the click that opens them. Your own plays, likes and dislikes while signed in aren&apos;t counted.
        </p>
      </div>
      <MusicListForm
        // Remounts when the track set changes (a track moved in or out), so the
        // form reloads from the server instead of keeping stale local state.
        key={tracks.map((t) => t.lessonId).join(",")}
        otherLists={otherLists}
        listId={list.id}
        trackStats={trackStats}
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
          releaseDate: list.releaseDate ? list.releaseDate.toISOString().slice(0, 10) : "",
          listenLinks: parseListenLinks(list.listenLinks),
          tracks: tracks.length > 0 ? tracks : [{ url: "", title: "", description: "", originalHtml: "" }],
        }}
      />
    </div>
  );
}
