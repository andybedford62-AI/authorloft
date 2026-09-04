import Link from "next/link";
import Image from "next/image";
import { Music, ListMusic, Play } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { Button } from "@/components/ui/button";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { accentAsSurface } from "@/lib/color-contrast";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  return {
    title: "Music",
    alternates: { canonical: `${getAuthorBaseUrl(author)}/music` },
    description: `Music and playlists from ${authorName}.`,
  };
}

export default async function MusicPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const lists = await prisma.course.findMany({
    where: { authorId: author.id, kind: "MUSIC", isPublished: true },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const totalTracks = lists.reduce(
    (sum, list) => sum + list.modules.reduce((n, m) => n + m.lessons.length, 0),
    0
  );

  // Deepened once so white overlay text/icons stay readable over any author
  // accent, light or dark — same helper the playlist hero uses.
  const surface = accentAsSurface(accentColor);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>
      <PageBanner
        label="Listen"
        title="Music"
        subtitle={`Music and playlists from ${author.displayName || author.name}.`}
        accentColor={accentColor}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {lists.length === 0 ? (
          <div className="text-center py-20">
            <Music className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-500">No music yet</h2>
            <p className="text-gray-400 mt-2 mb-8 max-w-sm mx-auto">
              Check back soon — playlists may appear here.
            </p>
            <Link href="/books">
              <Button variant="outline">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {lists.length} playlist{lists.length === 1 ? "" : "s"} · {totalTracks} track
              {totalTracks === 1 ? "" : "s"} to explore
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => {
                const trackCount = list.modules.reduce((n, m) => n + m.lessons.length, 0);
                return (
                  <Link
                    key={list.id}
                    href={`/music/${list.slug}`}
                    className="group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      {list.coverImageUrl ? (
                        <Image
                          src={list.coverImageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ background: `linear-gradient(135deg, ${surface}, #111827)` }}
                        />
                      )}
                      {!list.coverImageUrl && (
                        <ListMusic className="h-10 w-10 text-white/70 relative" />
                      )}

                      {/* Bottom scrim + track-count chip, always visible so the
                          card reads at a glance without hovering. */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white/90">
                        {trackCount} track{trackCount === 1 ? "" : "s"}
                      </span>

                      {/* Play button, scales in on hover — the "fun" cue that
                          this card opens straight into listening. */}
                      <span
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-200"
                      >
                        <span
                          className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200"
                          style={{ backgroundColor: surface }}
                        >
                          <Play className="h-5 w-5 fill-current translate-x-0.5" />
                        </span>
                      </span>
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 group-hover:text-[var(--accent)] transition-colors">
                        {list.title}
                      </h2>
                      {list.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{list.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
