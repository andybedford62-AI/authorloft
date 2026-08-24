import Link from "next/link";
import Image from "next/image";
import { Music, ListMusic } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { Button } from "@/components/ui/button";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
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

  return (
    <div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const trackCount = list.modules.reduce((n, m) => n + m.lessons.length, 0);
              return (
                <Link
                  key={list.id}
                  href={`/music/${list.slug}`}
                  className="group rounded-xl border border-gray-200 overflow-hidden bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                    {list.coverImageUrl ? (
                      <Image
                        src={list.coverImageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <ListMusic className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-900 group-hover:underline">{list.title}</h2>
                    {list.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{list.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {trackCount} track{trackCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
