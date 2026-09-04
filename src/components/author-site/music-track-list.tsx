"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ExternalLink, Music, ListMusic } from "lucide-react";
import { resolveTrackLink, providerLabel } from "@/lib/music-links";
import { accentAsSurface, accentAsTextOn } from "@/lib/color-contrast";

// Click-to-play, mirroring book-preview-gallery: only the opened track loads an
// iframe, so a 50-track list costs one embed instead of fifty. That's what keeps
// the page fast at any length, and it's why the track cap is a product choice
// rather than a performance one.
//
// Providers that refuse framing (Suno sends frame-ancestors 'none') never get an
// iframe at all — they render as a card that opens in a new tab. Pretending
// otherwise would paint an empty grey box.

export type PublicTrack = {
  id: string;
  title: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  /** Plain-text one-liner for the collapsed row. */
  description: string | null;
  /** Sanitized on the server; shown under the player when a track is open, so
   *  richer notes (and any image) survive rather than being dropped. */
  descriptionHtml: string | null;
};

export type PlaylistHero = {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
};

export function MusicTrackList({
  tracks,
  accentColor,
  hero,
}: {
  tracks: PublicTrack[];
  accentColor: string;
  hero: PlaylistHero;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Deepened once and reused everywhere white sits on the accent, so the hero,
  // the play button, and the hover state all clear the same contrast floor
  // regardless of how light an author's chosen accent is.
  const surface = accentAsSurface(accentColor);
  const textOnWhite = accentAsTextOn(accentColor);

  const firstEmbeddable = tracks.find((t) => {
    const link = t.videoUrl ? resolveTrackLink(t.videoUrl) : null;
    return link?.mode === "embed" && !!link.embedUrl;
  });

  return (
    <div style={{ "--accent": accentColor, "--accent-surface": surface } as React.CSSProperties}>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
        {hero.coverImageUrl ? (
          <>
            <Image
              src={hero.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${surface}, #111827)` }}
          />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-white/75 mb-1.5">
            Playlist · {tracks.length} track{tracks.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight truncate sm:whitespace-normal sm:line-clamp-2">
                {hero.title}
              </h1>
              {hero.description && (
                <p className="hidden sm:block text-white/80 text-sm mt-2 max-w-xl line-clamp-2">
                  {hero.description}
                </p>
              )}
            </div>

            {firstEmbeddable && (
              <button
                type="button"
                onClick={() => setOpenId(firstEmbeddable.id)}
                className="flex-shrink-0 flex items-center gap-2 rounded-full pl-4 pr-5 py-2.5 font-semibold text-sm text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: surface }}
              >
                <Play className="h-4 w-4 fill-current" />
                Play
              </button>
            )}
          </div>
        </div>
      </div>

      {hero.description && (
        <p className="sm:hidden text-gray-600 text-sm mb-6 -mt-4 whitespace-pre-line">
          {hero.description}
        </p>
      )}

      {/* ── Track list ──────────────────────────────────────────────────────── */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200">
          <ListMusic className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No tracks in this list yet.</p>
        </div>
      ) : (
        <ul className="rounded-xl border border-gray-200 overflow-hidden bg-white divide-y divide-gray-100">
          {tracks.map((track, index) => {
            const link = track.videoUrl ? resolveTrackLink(track.videoUrl) : null;
            const isOpen = openId === track.id;
            const canEmbed = link?.mode === "embed" && !!link.embedUrl;

            return (
              <li key={track.id} className="bg-white">
                {isOpen && canEmbed ? (
                  <div
                    className="p-4"
                    style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 5%, white)` }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-wide mb-2"
                      style={{ color: textOnWhite }}
                    >
                      Now Playing
                    </p>
                    <div className="rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={link!.embedUrl!}
                        title={track.title}
                        className="w-full block"
                        style={{ height: link!.embedHeight ?? 200 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-900">{track.title}</p>
                    {track.descriptionHtml && (
                      <div
                        className="rich-content text-sm text-gray-600 mt-1"
                        dangerouslySetInnerHTML={{ __html: track.descriptionHtml }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenId(null)}
                      className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <TrackRow
                    track={track}
                    index={index}
                    surface={surface}
                    canEmbed={canEmbed}
                    href={link?.canonicalUrl ?? track.videoUrl ?? "#"}
                    providerName={link ? providerLabel(link.provider) : null}
                    onPlay={() => setOpenId(track.id)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TrackRow({
  track,
  index,
  surface,
  canEmbed,
  href,
  providerName,
  onPlay,
}: {
  track: PublicTrack;
  index: number;
  surface: string;
  canEmbed: boolean;
  href: string;
  providerName: string | null;
  onPlay: () => void;
}) {
  const inner = (
    <>
      {/* Track number, replaced by a play glyph on hover — the artwork sits
          behind both so a track keeps its cover art either way. */}
      <span className="relative h-11 w-11 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {track.thumbnailUrl ? (
          // next/image proxies through our own origin, so an arbitrary artwork
          // host needs no img-src entry (remotePatterns already allows https).
          <Image src={track.thumbnailUrl} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <Music className="h-4 w-4 text-gray-400" />
        )}
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEmbed ? (
            <Play className="h-4 w-4 fill-current" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
        </span>
        {!track.thumbnailUrl && (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center group-hover:opacity-0 transition-opacity"
            style={{ backgroundColor: surface }}
          >
            {index + 1}
          </span>
        )}
      </span>

      <span className="flex-1 min-w-0 text-left">
        <span className="block text-sm font-medium text-gray-900 truncate">{track.title}</span>
        {track.description ? (
          <span className="block text-xs text-gray-500 truncate">{track.description}</span>
        ) : providerName ? (
          <span className="block text-xs text-gray-500">
            {canEmbed ? providerName : `Opens on ${providerName}`}
          </span>
        ) : null}
      </span>

      {canEmbed ? (
        <Play className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: surface }} />
      ) : (
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
      )}
    </>
  );

  const className =
    "group w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_6%,white)]";

  return canEmbed ? (
    <button type="button" onClick={onPlay} className={className}>
      {inner}
    </button>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}
