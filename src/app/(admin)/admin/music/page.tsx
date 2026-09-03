import Link from "next/link";
import { Plus, ListMusic, Music } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { NavVisibilityBanner } from "@/components/admin/nav-visibility-banner";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MusicAddTabs } from "@/components/admin/music-add-tabs";
import { FeaturedStarButton } from "@/components/admin/featured-star-button";

export const dynamic = "force-dynamic";

export default async function MusicListsPage() {
  const authorId = await getAdminAuthorId();

  const lists = await prisma.course.findMany({
    where: { authorId, kind: "MUSIC" },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const limits = await getAuthorPlanLimits(authorId);
  const max = (limits as any).maxMusicLists as number | null;
  const trackCap = (limits as any).maxTracksPerList as number | null;
  const atCap = max !== null && lists.length >= max;

  return (
    <div className="space-y-6 max-w-5xl">
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
        <div className="space-y-3">
          {lists.map((list) => {
            const trackCount = list.modules.reduce((n, m) => n + m.lessons.length, 0);
            return (
              <div
                key={list.id}
                className="relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <Link
                  href={`/admin/music/${list.id}/edit`}
                  className="absolute inset-0 z-0"
                  aria-label={`Edit ${list.title}`}
                />

                {/* Cover */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {list.coverImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={list.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ListMusic className="h-6 w-6 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {list.title}
                    </h3>
                    <Badge variant={list.isPublished ? "success" : "outline"}>
                      {list.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {list.description && (
                    <p className="text-xs text-gray-500 truncate mb-0.5">{list.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {trackCount} track{trackCount === 1 ? "" : "s"}
                  </p>
                </div>

                <FeaturedStarButton
                  endpoint={`/api/admin/music/${list.id}/feature`}
                  initialFeatured={list.isFeatured}
                />
              </div>
            );
          })}
        </div>
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
