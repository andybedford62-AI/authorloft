import Link from "next/link";
import { Plus, Music } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { NavVisibilityBanner } from "@/components/admin/nav-visibility-banner";
import { MusicNoSalesBanner } from "@/components/admin/music-no-sales-banner";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { Button } from "@/components/ui/button";
import { MusicAddTabs } from "@/components/admin/music-add-tabs";
import { MusicListClient } from "@/components/admin/music-list-client";
import { getAuthorBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function MusicListsPage() {
  const authorId = await getAdminAuthorId();

  const lists = await prisma.course.findMany({
    where: { authorId, kind: "MUSIC" },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const [limits, author] = await Promise.all([
    getAuthorPlanLimits(authorId),
    prisma.author.findUnique({ where: { id: authorId }, select: { slug: true, customDomain: true } }),
  ]);
  const max = (limits as any).maxMusicLists as number | null;
  const trackCap = (limits as any).maxTracksPerList as number | null;
  const atCap = max !== null && lists.length >= max;

  return (
    <div className="space-y-6 max-w-5xl">
      <MusicNoSalesBanner />
      <NavVisibilityBanner authorId={authorId} navKey="music" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Music</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lists.length} list{lists.length !== 1 ? "s" : ""}
            {max !== null ? ` of ${max}` : ""} &mdash;{" "}
            {lists.filter((l) => l.isPublished).length} published
          </p>
        </div>
        {!atCap && (
          <Link href="/admin/music/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Music List / Album</Button>
          </Link>
        )}
      </div>

      <MusicAddTabs atListLimit={atCap} trackCap={trackCap} />

      {lists.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Music className="h-10 w-10 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">No music lists or albums yet</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
            Import a YouTube playlist or paste your links above &mdash; YouTube and Spotify
            play inline, Suno and other sites open in a new tab. Nothing is uploaded.
          </p>
          <Link href="/admin/music/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Music List / Album</Button>
          </Link>
        </div>
      ) : (
        <MusicListClient
          publicBaseUrl={author ? getAuthorBaseUrl(author) : ""}
          initialLists={lists.map((list) => ({
            id: list.id,
            slug: list.slug,
            title: list.title,
            description: list.description,
            coverImageUrl: list.coverImageUrl,
            isPublished: list.isPublished,
            isFeatured: list.isFeatured,
            listInBookstore: list.listInBookstore,
            releaseType: list.releaseType,
            trackCount: list.modules.reduce((n, m) => n + m.lessons.length, 0),
          }))}
        />
      )}

      {atCap && (
        <p className="text-sm text-amber-700">
          You&apos;ve reached your plan&apos;s limit of {max} music lists.{" "}
          <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to add more.
        </p>
      )}
    </div>
  );
}
