import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ListMusic } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const list = await getList(author.id, slug);
  if (!list) return { title: "Not Found" };

  return {
    title: list.title,
    description: list.description || `${list.title} — music from ${author.displayName || author.name}.`,
    alternates: { canonical: `${getAuthorBaseUrl(author)}/music/${slug}` },
    openGraph: {
      title: list.title,
      description: list.description || undefined,
      images: list.coverImageUrl ? [{ url: list.coverImageUrl }] : undefined,
    },
  };
}

export default async function MusicListPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const list = await getList(author.id, slug);
  if (!list) notFound();

  const tracks: PublicTrack[] = list.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      videoUrl: l.videoUrl,
      thumbnailUrl: l.thumbnailUrl,
    }))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/music"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All music
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative h-40 w-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {list.coverImageUrl ? (
            <Image src={list.coverImageUrl} alt="" fill sizes="160px" className="object-cover" />
          ) : (
            <ListMusic className="h-10 w-10 text-gray-300" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{list.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {tracks.length} track{tracks.length === 1 ? "" : "s"}
          </p>
          {list.description && (
            <p className="text-gray-600 mt-3 whitespace-pre-line">{list.description}</p>
          )}
        </div>
      </div>

      <MusicTrackList tracks={tracks} accentColor={author.accentColor} />
    </div>
  );
}
