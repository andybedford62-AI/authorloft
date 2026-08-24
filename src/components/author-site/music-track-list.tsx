"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ExternalLink, Music } from "lucide-react";
import { resolveTrackLink, providerLabel } from "@/lib/music-links";

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
};

export function MusicTrackList({
  tracks,
  accentColor,
}: {
  tracks: PublicTrack[];
  accentColor: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (tracks.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No tracks in this list yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-white">
      {tracks.map((track) => {
        const link = track.videoUrl ? resolveTrackLink(track.videoUrl) : null;
        const isOpen = openId === track.id;
        const canEmbed = link?.mode === "embed" && !!link.embedUrl;

        return (
          <li key={track.id} className="bg-white">
            {isOpen && canEmbed ? (
              <div className="p-3">
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
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <TrackRow
                track={track}
                accentColor={accentColor}
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
  );
}

function TrackRow({
  track,
  accentColor,
  canEmbed,
  href,
  providerName,
  onPlay,
}: {
  track: PublicTrack;
  accentColor: string;
  canEmbed: boolean;
  href: string;
  providerName: string | null;
  onPlay: () => void;
}) {
  const inner = (
    <>
      <span className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        {track.thumbnailUrl ? (
          // next/image proxies through our own origin, so an arbitrary artwork
          // host needs no img-src entry (remotePatterns already allows https).
          <Image src={track.thumbnailUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <Music className="h-5 w-5 text-gray-400" />
        )}
      </span>

      <span className="flex-1 min-w-0 text-left">
        <span className="block text-sm font-medium text-gray-900 truncate">{track.title}</span>
        {providerName && (
          <span className="block text-xs text-gray-500">
            {canEmbed ? providerName : `Opens on ${providerName}`}
          </span>
        )}
      </span>

      {canEmbed ? (
        <Play className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
      ) : (
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
      )}
    </>
  );

  const className =
    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors";

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
