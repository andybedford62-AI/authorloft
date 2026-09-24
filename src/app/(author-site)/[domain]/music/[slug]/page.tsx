import { toMetaDescription } from "@/lib/meta-text";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { sanitize } from "@/lib/sanitize";
import { resolveTrackLink } from "@/lib/music-links";
import { releaseLabel, trackKeys, findTrackIndex, parseListenLinks } from "@/lib/music-share";
import { MusicTrackList, type PublicTrack } from "@/components/author-site/music-track-list";
import type { Metadata } from "next";

/** Scoped by kind so a course slug can never be served from /music. */
async function getList(authorId: string, slug: string) {
  return prisma.course.findFirst({
    where: { authorId, slug, kind: "MUSIC", isPublished: true },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

type List = NonNullable<Awaited<ReturnType<typeof getList>>>;

/** Flat, ordered track rows with their `?track=` keys and artwork. */
function flattenTracks(list: List) {
  const lessons = list.modules.flatMap((m) => m.lessons);
  const keys = trackKeys(lessons.map((l) => l.title));
  return lessons.map((l, i) => {
    // Tracks imported from elsewhere have no cached artwork. A YouTube
    // thumbnail is derivable from the id, so fall back to it rather than
    // showing a placeholder icon.
    const link = l.videoUrl ? resolveTrackLink(l.videoUrl) : null;
    const ytId =
      link?.provider === "youtube" && link.embedUrl
        ? link.embedUrl.split("/embed/")[1]
        : null;
    return {
      lesson: l,
      shareKey: keys[i],
      thumbnailUrl: l.thumbnailUrl ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null),
    };
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ track?: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const { track } = await searchParams;
  const author = await getAuthorByDomain(domain);
  const list = await getList(author.id, slug);
  if (!list) return { title: "Not Found" };

  const artist = author.displayName || author.name;
  const label = releaseLabel(list.releaseType);
  const canonical = `${getAuthorBaseUrl(author)}/music/${slug}`;
  const tracks = flattenTracks(list);

  // A `?track=` link previews as that song — its own title and artwork — so a
  // post about one track doesn't unfurl as the whole list. Canonical stays the
  // list page either way.
  const shared = tracks[findTrackIndex(tracks.map((t) => t.shareKey), track)];

  const title = shared
    ? `${shared.lesson.title} — ${artist}`
    : label === "Playlist" ? `${list.title} · Playlist by ${artist}` : `${list.title} — ${label} by ${artist}`;
  const description = shared
    ? `Listen to "${shared.lesson.title}" from ${list.title} by ${artist}.`
    : toMetaDescription(list.description, `Listen to ${list.title}, a ${label.toLowerCase()} from ${artist}. Stream the tracks and discover more of their music.`);

  // Page-level openGraph replaces the layout's wholesale, so without a
  // fallback here a coverless list unfurled with no image at all. Real images
  // only: the track's artwork, the cover, then the artist's own photo.
  const image =
    (shared?.thumbnailUrl) ||
    list.coverImageUrl ||
    tracks.find((t) => t.thumbnailUrl)?.thumbnailUrl ||
    author.profileImageUrl ||
    null;

  return {
    title: shared ? shared.lesson.title : list.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "music.playlist",
      title,
      description,
      url: canonical,
      siteName: artist,
      ...(image && { images: [{ url: image, alt: shared?.lesson.title ?? list.title }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function MusicListPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ track?: string }>;
}) {
  const { domain, slug } = await params;
  const { track } = await searchParams;
  const author = await getAuthorByDomain(domain);
  const list = await getList(author.id, slug);
  if (!list) notFound();

  const flat = flattenTracks(list);
  const tracks: PublicTrack[] = flat.map(({ lesson: l, shareKey, thumbnailUrl }) => {
    const html = l.contentHtml?.trim() ? sanitize(l.contentHtml) : null;
    // Plain-text one-liner for the collapsed row; the full note (image and
    // all) still renders under the player once the track is open.
    const text = html
      ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null
      : null;

    return {
      id: l.id,
      shareKey,
      title: l.title,
      videoUrl: l.videoUrl,
      thumbnailUrl,
      description: text,
      descriptionHtml: html,
    };
  });

  const initialIndex = findTrackIndex(tracks.map((t) => t.shareKey), track);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/music"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All music
      </Link>

      <MusicTrackList
        tracks={tracks}
        accentColor={author.accentColor}
        initialTrackId={initialIndex >= 0 ? tracks[initialIndex].id : null}
        hero={{
          title: list.title,
          description: list.description,
          coverImageUrl: list.coverImageUrl,
          releaseLabel: releaseLabel(list.releaseType),
          releaseYear: list.releaseDate ? list.releaseDate.getUTCFullYear() : null,
          artistName: author.displayName || author.name,
        }}
        // Albums, EPs and singles read as a numbered tracklist; playlists keep
        // the artwork grid, which suits their mostly-video tracks.
        layout={list.releaseType && list.releaseType !== "PLAYLIST" ? "list" : "grid"}
        listenLinks={parseListenLinks(list.listenLinks)}
        share={{
          url: `${getAuthorBaseUrl(author)}/music/${slug}`,
          campaign: slug,
        }}
      />
    </div>
  );
}
