"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ExternalLink, ListMusic } from "lucide-react";
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

      {/* ── Track cards ─────────────────────────────────────────────────────── */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200">
          <ListMusic className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No tracks in this list yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map((track, index) => {
            const link = track.videoUrl ? resolveTrackLink(track.videoUrl) : null;
            const isOpen = openId === track.id;
            const canEmbed = link?.mode === "embed" && !!link.embedUrl;

            return isOpen && canEmbed ? (
              <div
                key={track.id}
                className="rounded-2xl border overflow-hidden sm:col-span-2 lg:col-span-3"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, #e5e7eb)`,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 5%, white)`,
                }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: textOnWhite }}>
                      Now Playing
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenId(null)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-800"
                    >
                      Close ✕
                    </button>
                  </div>
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
                </div>
              </div>
            ) : (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                surface={surface}
                canEmbed={canEmbed}
                canonicalUrl={link?.canonicalUrl ?? track.videoUrl ?? null}
                providerName={link ? providerLabel(link.provider) : null}
                onPlay={() => setOpenId(track.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrackCard({
  track,
  index,
  surface,
  canEmbed,
  canonicalUrl,
  providerName,
  onPlay,
}: {
  track: PublicTrack;
  index: number;
  surface: string;
  canEmbed: boolean;
  canonicalUrl: string | null;
  providerName: string | null;
  onPlay: () => void;
}) {
  let hostname: string | null = null;
  if (canonicalUrl) {
    try {
      hostname = new URL(canonicalUrl).hostname.replace(/^www\./, "");
    } catch {
      hostname = null;
    }
  }

  const mediaClassName =
    "relative aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden";

  const mediaInner = (
    <>
      {track.thumbnailUrl ? (
        <Image
          src={track.thumbnailUrl}
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
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />

      <span
        className="relative h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
        style={{ backgroundColor: surface }}
      >
        {canEmbed ? (
          <Play className="h-5 w-5 fill-current translate-x-0.5" />
        ) : (
          <ExternalLink className="h-5 w-5" />
        )}
      </span>

      <span
        className="absolute top-2.5 left-2.5 h-5 w-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        {index + 1}
      </span>
    </>
  );

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Artwork + big play/external button — the primary, always-visible
          affordance rather than something only hover reveals. A real <a>
          for non-embeddable tracks so ctrl/cmd-click, middle-click, and
          "copy link" behave like a normal link instead of only working via
          a JS-driven window.open(). */}
      {canEmbed ? (
        <button type="button" onClick={onPlay} className={mediaClassName}>
          {mediaInner}
        </button>
      ) : (
        <a
          href={canonicalUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={mediaClassName}
        >
          {mediaInner}
        </a>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{track.title}</h3>
        {track.description ? (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{track.description}</p>
        ) : providerName ? (
          <p className="text-xs text-gray-500 mt-1">
            {canEmbed ? `Plays here · ${providerName}` : `Opens on ${providerName}`}
          </p>
        ) : null}

        {hostname && (
          <a
            href={canonicalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-3 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{hostname}</span>
          </a>
        )}
      </div>
    </div>
  );
}
