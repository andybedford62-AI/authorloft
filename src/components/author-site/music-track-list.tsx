"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Play, ExternalLink, ListMusic, Share2, Check, SkipBack, SkipForward, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { resolveTrackLink, providerLabel, type ResolvedTrackLink } from "@/lib/music-links";
import { accentAsSurface, accentAsTextOn } from "@/lib/color-contrast";
import { taggedUrl, listenPlatform } from "@/lib/music-share";
import { MusicShareBar, shareOrCopy } from "@/components/author-site/music-share-bar";

// Click-to-play, mirroring book-preview-gallery: only the playing track loads an
// iframe, so a 50-track list costs one embed instead of fifty. That's what keeps
// the page fast at any length, and it's why the track cap is a product choice
// rather than a performance one.
//
// The player lives in a dock pinned to the bottom of the screen rather than
// expanding inline, so starting a track never reflows the list under the
// listener, and it keeps playing while they scroll.
//
// Providers that refuse framing (Suno sends frame-ancestors 'none') never get an
// iframe at all — they render as a card that opens in a new tab. Pretending
// otherwise would paint an empty grey box. Play all / auto-advance therefore
// only walks the embeddable tracks.

export type PublicTrack = {
  id: string;
  /** `?track=` value — see trackKeys() in lib/music-share. */
  shareKey: string;
  title: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  /** Plain-text one-liner for the collapsed row. */
  description: string | null;
  /** Sanitized on the server; shown in the player, so richer notes (and any
   *  image) survive rather than being dropped. */
  descriptionHtml: string | null;
};

export type PlaylistHero = {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  /** "Playlist", "Album", "EP" or "Single". */
  releaseLabel: string;
  releaseYear: number | null;
  artistName: string;
};

export type PlaylistShare = {
  /** Canonical list URL, untagged. */
  url: string;
  /** utm_campaign — the list slug. */
  campaign: string;
};

type ResolvedTrack = PublicTrack & {
  link: ResolvedTrackLink | null;
  canEmbed: boolean;
};

export function MusicTrackList({
  tracks: rawTracks,
  accentColor,
  hero,
  share,
  layout,
  listenLinks,
  initialTrackId,
}: {
  tracks: PublicTrack[];
  accentColor: string;
  hero: PlaylistHero;
  share: PlaylistShare;
  /** "list" = numbered tracklist (albums/EPs/singles); "grid" = artwork cards (playlists). */
  layout: "list" | "grid";
  /** Album-level "Listen on" links. */
  listenLinks: string[];
  /** From a `?track=` deep link: played (or highlighted, if it can't embed) on load. */
  initialTrackId?: string | null;
}) {
  const tracks: ResolvedTrack[] = rawTracks.map((t) => {
    const link = t.videoUrl ? resolveTrackLink(t.videoUrl) : null;
    return { ...t, link, canEmbed: link?.mode === "embed" && !!link.embedUrl };
  });
  const embeddable = tracks.filter((t) => t.canEmbed);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(initialTrackId ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const trackRefs = useRef<Record<string, HTMLElement | null>>({});

  // Deepened once and reused everywhere white sits on the accent, so the hero
  // and the hover state both clear the same contrast floor regardless of how
  // light an author's chosen accent is.
  const surface = accentAsSurface(accentColor);
  const textOnWhite = accentAsTextOn(accentColor);

  // Keep the address bar pointing at the playing track, so copying the URL
  // from the browser shares the song rather than the whole list.
  const play = useCallback((id: string | null) => {
    setCurrentId(id);
    const key = id ? rawTracks.find((t) => t.id === id)?.shareKey : null;
    const u = new URL(window.location.href);
    if (key) u.searchParams.set("track", key);
    else u.searchParams.delete("track");
    window.history.replaceState(null, "", u.toString());
  }, [rawTracks]);

  const current = currentId ? tracks.find((t) => t.id === currentId) ?? null : null;
  const queuePos = current ? embeddable.findIndex((t) => t.id === current.id) : -1;
  const prevTrack = queuePos > 0 ? embeddable[queuePos - 1] : null;
  const nextTrack = queuePos >= 0 && queuePos < embeddable.length - 1 ? embeddable[queuePos + 1] : null;
  const nextId = nextTrack?.id ?? null;

  const playNext = useCallback(() => {
    if (nextId) play(nextId);
  }, [nextId, play]);

  // Deep link: play the shared track (embeds) or just spotlight it (link-out
  // cards — opening a new tab unprompted would be blocked anyway), then bring
  // it into view.
  useEffect(() => {
    if (!initialTrackId) return;
    const track = tracks.find((t) => t.id === initialTrackId);
    if (!track) return;
    if (track.canEmbed) setCurrentId(track.id);
    // setTimeout rather than requestAnimationFrame: rAF never fires in a
    // background tab, and a link opened with ctrl/cmd-click starts there.
    const scroll = setTimeout(
      () => trackRefs.current[track.id]?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50
    );
    const unhighlight = setTimeout(() => setHighlightId(null), 4000);
    return () => { clearTimeout(scroll); clearTimeout(unhighlight); };
    // Deliberately once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function trackUrl(track: PublicTrack) {
    const u = new URL(share.url);
    u.searchParams.set("track", track.shareKey);
    return u.toString();
  }

  async function shareTrack(track: PublicTrack) {
    const result = await shareOrCopy(
      taggedUrl(trackUrl(track), "share-sheet", share.campaign, "share"),
      track.title,
      `Listen to "${track.title}" by ${hero.artistName}`
    );
    if (result === "copied") {
      setCopiedId(track.id);
      setTimeout(() => setCopiedId((c) => (c === track.id ? null : c)), 2000);
    }
  }

  const shareText = `Listen to "${hero.title}"${
    hero.releaseLabel === "Playlist" ? `, a playlist from ${hero.artistName}` : ` by ${hero.artistName}`
  }`;

  const itemProps = (track: ResolvedTrack, index: number) => ({
    track,
    index,
    surface,
    textOnWhite,
    isPlaying: current?.id === track.id,
    copied: copiedId === track.id,
    providerName: track.link ? providerLabel(track.link.provider) : null,
    canonicalUrl: track.link?.canonicalUrl ?? track.videoUrl ?? null,
    onPlay: () => play(track.id),
    onShare: () => shareTrack(track),
  });

  const highlightWrap = (track: ResolvedTrack, className: string) => ({
    ref: (el: HTMLElement | null) => { trackRefs.current[track.id] = el; },
    className: `scroll-mt-24 transition-shadow duration-500 ${className} ${
      highlightId === track.id ? "ring-2 ring-offset-2" : ""
    }`,
    style: highlightId === track.id ? ({ "--tw-ring-color": surface } as React.CSSProperties) : undefined,
  });

  return (
    <div
      style={{ "--accent": accentColor, "--accent-surface": surface } as React.CSSProperties}
      // Room under the list so the dock never sits on top of the last tracks.
      className={current ? "pb-80 sm:pb-72" : undefined}
    >
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
        {hero.coverImageUrl ? (
          <>
            <Image
              src={hero.coverImageUrl}
              alt={hero.title}
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
            {hero.releaseLabel} · {tracks.length} track{tracks.length === 1 ? "" : "s"}
            {hero.releaseYear ? ` · ${hero.releaseYear}` : ""}
          </p>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight truncate sm:whitespace-normal sm:line-clamp-2">
              {hero.title}
            </h1>
            {/* `hidden` lives on a wrapper: line-clamp sets its own display,
                which beat `hidden` on the same element and showed the
                description twice on phones (here and below the hero). */}
            {hero.description && (
              <div className="hidden sm:block">
                <p className="text-white/80 text-sm mt-2 max-w-xl line-clamp-2">
                  {hero.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hero.description && (
        <p className="sm:hidden text-gray-600 text-sm mb-4 -mt-4 whitespace-pre-line">
          {hero.description}
        </p>
      )}

      {/* ── Actions: Play all, Listen on, Share ─────────────────────────────── */}
      <div className="mb-8 -mt-2 space-y-4">
        {(embeddable.length > 0 || listenLinks.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {embeddable.length > 0 && (
              <button
                type="button"
                onClick={() => play(embeddable[0].id)}
                className="inline-flex items-center gap-2 rounded-full pl-4 pr-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: surface }}
              >
                <Play className="h-4 w-4 fill-current" /> Play all
              </button>
            )}
            {listenLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Listen on</span>
                {listenLinks.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    style={{ borderColor: `color-mix(in srgb, ${accentColor} 40%, #e5e7eb)`, color: textOnWhite }}
                  >
                    {listenPlatform(url)} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        <MusicShareBar
          url={share.url}
          title={hero.title}
          text={shareText}
          campaign={share.campaign}
          accentSurface={surface}
        />
      </div>

      {/* ── Tracks ──────────────────────────────────────────────────────────── */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200">
          <ListMusic className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No tracks in this list yet.</p>
        </div>
      ) : layout === "list" ? (
        <ol className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {tracks.map((track, index) => (
            <li key={track.id} {...highlightWrap(track, "")}>
              <TrackRow {...itemProps(track, index)} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map((track, index) => (
            <div key={track.id} {...highlightWrap(track, "rounded-2xl")}>
              <TrackCard {...itemProps(track, index)} />
            </div>
          ))}
        </div>
      )}

      {current && current.canEmbed && (
        <NowPlayingDock
          track={current}
          position={queuePos + 1}
          total={embeddable.length}
          textOnWhite={textOnWhite}
          copied={copiedId === current.id}
          onPrev={prevTrack ? () => play(prevTrack.id) : null}
          onNext={nextTrack ? playNext : null}
          onEnded={playNext}
          onShare={() => shareTrack(current)}
          onClose={() => play(null)}
        />
      )}
    </div>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────

type ItemProps = {
  track: ResolvedTrack;
  index: number;
  surface: string;
  textOnWhite: string;
  isPlaying: boolean;
  copied: boolean;
  providerName: string | null;
  canonicalUrl: string | null;
  onPlay: () => void;
  onShare: () => void;
};

/** Three pulsing bars marking the playing track. */
function PlayingBars({ color }: { color: string }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-3.5" aria-hidden>
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="w-[3px] rounded-sm animate-pulse"
          style={{ backgroundColor: color, height: `${60 + delay * 80}%`, animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function ShareButton({ copied, onShare, title, size = "sm" }: { copied: boolean; onShare: () => void; title: string; size?: "sm" | "xs" }) {
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <button
      type="button"
      onClick={onShare}
      className={`flex-shrink-0 inline-flex items-center gap-1 font-medium text-gray-400 hover:text-gray-700 transition-colors ${size === "sm" ? "text-xs" : "text-[11px]"}`}
      aria-label={`Share ${title}`}
    >
      {copied ? <><Check className={`${icon} text-emerald-600`} /> Copied</> : <><Share2 className={icon} /> Share</>}
    </button>
  );
}

// ── Tracklist row (albums / EPs / singles) ────────────────────────────────────

function TrackRow({ track, index, textOnWhite, isPlaying, copied, providerName, canonicalUrl, onPlay, onShare }: ItemProps) {
  const inner = (
    <>
      <span className="w-7 flex-shrink-0 flex items-center justify-center text-sm tabular-nums text-gray-400">
        {isPlaying ? (
          <PlayingBars color={textOnWhite} />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            {track.canEmbed
              ? <Play className="h-3.5 w-3.5 fill-current hidden group-hover:block" style={{ color: textOnWhite }} />
              : <ExternalLink className="h-3.5 w-3.5 hidden group-hover:block" />}
          </>
        )}
      </span>
      {track.thumbnailUrl && (
        <span className="relative hidden sm:block w-16 aspect-video rounded overflow-hidden bg-gray-100 flex-shrink-0">
          <Image src={track.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span
          className="block text-sm font-medium truncate"
          style={{ color: isPlaying ? textOnWhite : "#111827" }}
        >
          {track.title}
        </span>
        <span className="block text-xs text-gray-500 truncate">
          {track.description ?? (providerName ? (track.canEmbed ? `Plays here · ${providerName}` : `Opens on ${providerName}`) : "")}
        </span>
      </span>
    </>
  );

  const rowClass = "group flex-1 min-w-0 flex items-center gap-3 text-left py-3 pl-3 sm:pl-4";

  return (
    <div
      className="flex items-center gap-3 pr-3 sm:pr-4 transition-colors hover:bg-gray-50"
      style={isPlaying ? { backgroundColor: `color-mix(in srgb, ${textOnWhite} 6%, white)` } : undefined}
    >
      {track.canEmbed ? (
        <button type="button" onClick={onPlay} className={rowClass} aria-label={`Play ${track.title}`}>
          {inner}
        </button>
      ) : (
        <a href={canonicalUrl ?? "#"} target="_blank" rel="noopener noreferrer" className={rowClass}>
          {inner}
        </a>
      )}
      <ShareButton copied={copied} onShare={onShare} title={track.title} size="xs" />
    </div>
  );
}

// ── Artwork card (playlists) ──────────────────────────────────────────────────

function TrackCard({ track, index, surface, textOnWhite, isPlaying, copied, providerName, canonicalUrl, onPlay, onShare }: ItemProps) {
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
          alt={track.title}
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
      <div className={`absolute inset-0 transition-colors ${isPlaying ? "bg-black/45" : "bg-black/10 group-hover:bg-black/25"}`} />

      {isPlaying ? (
        <span className="relative inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow" style={{ color: textOnWhite }}>
          <PlayingBars color={textOnWhite} /> Playing
        </span>
      ) : (
        <span
          className="relative h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
          style={{ backgroundColor: surface }}
        >
          {track.canEmbed ? (
            <Play className="h-5 w-5 fill-current translate-x-0.5" />
          ) : (
            <ExternalLink className="h-5 w-5" />
          )}
        </span>
      )}

      <span
        className="absolute top-2.5 left-2.5 h-5 w-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        {index + 1}
      </span>
    </>
  );

  return (
    <div
      className={`group h-full rounded-2xl border bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${
        isPlaying ? "" : "border-gray-200"
      }`}
      style={isPlaying ? { borderColor: textOnWhite } : undefined}
    >
      {/* Artwork + big play/external button — the primary, always-visible
          affordance rather than something only hover reveals. A real <a>
          for non-embeddable tracks so ctrl/cmd-click, middle-click, and
          "copy link" behave like a normal link instead of only working via
          a JS-driven window.open(). */}
      {track.canEmbed ? (
        <button type="button" onClick={onPlay} className={mediaClassName} aria-label={`Play ${track.title}`}>
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
            {track.canEmbed ? `Plays here · ${providerName}` : `Opens on ${providerName}`}
          </p>
        ) : null}

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          {hostname ? (
            <a
              href={canonicalUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{hostname}</span>
            </a>
          ) : <span />}
          <ShareButton copied={copied} onShare={onShare} title={track.title} size="xs" />
        </div>
      </div>
    </div>
  );
}

// ── Now Playing dock ──────────────────────────────────────────────────────────

const YT_ORIGIN = /^https:\/\/www\.youtube(-nocookie)?\.com$/;

function NowPlayingDock({
  track,
  position,
  total,
  textOnWhite,
  copied,
  onPrev,
  onNext,
  onEnded,
  onShare,
  onClose,
}: {
  track: ResolvedTrack;
  position: number;
  total: number;
  textOnWhite: string;
  copied: boolean;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  onEnded: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  const [minimized, setMinimized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const endedRef = useRef(false);
  const link = track.link!;
  const isYouTube = link.provider === "youtube";

  // A user click started this, so autoplay is allowed. enablejsapi lets the
  // player report its state back over postMessage — how we know a YouTube
  // track ended and can move on. No script to load, so no CSP change.
  // Spotify reports nothing without their iframe API script, so its tracks
  // simply don't auto-advance (Next still works).
  const src = isYouTube
    ? `${link.embedUrl}?autoplay=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`
    : link.embedUrl!;

  useEffect(() => {
    endedRef.current = false;
  }, [track.id]);

  useEffect(() => {
    if (!isYouTube) return;
    function onMessage(e: MessageEvent) {
      if (!YT_ORIGIN.test(e.origin) || e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string; info?: unknown } | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const state =
        data?.event === "onStateChange" ? data.info
        : data?.event === "infoDelivery" ? (data.info as { playerState?: number } | undefined)?.playerState
        : undefined;
      // 0 = ended. The player can report it more than once; act on the first.
      if (state === 0 && !endedRef.current) {
        endedRef.current = true;
        onEnded();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isYouTube, onEnded]);

  function handleLoad() {
    if (!isYouTube) return;
    // Subscribes this page to the player's state events.
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: track.id, channel: "widget" }),
      "*"
    );
  }

  const iconBtn =
    "p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

  return (
    // Bottom-LEFT on desktop and one layer under z-40: the cookie consent card
    // (consent-banner.tsx) owns the bottom-right corner at z-40, and on phones,
    // where both span the width, it must stay on top until dismissed.
    <div
      className="fixed z-30 inset-x-0 bottom-0 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[380px] bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
      role="region"
      aria-label="Now playing"
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <PlayingBars color={textOnWhite} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: textOnWhite }}>
            Now playing · {position} of {total}
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate">{track.title}</p>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((v) => !v)}
          className={iconBtn}
          aria-label={minimized ? "Show player" : "Minimize player"}
          title={minimized ? "Show player" : "Minimize"}
        >
          {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onClose} className={iconBtn} aria-label="Close player" title="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Kept mounted while minimized (just collapsed), so the music doesn't stop. */}
      <div
        className="bg-black overflow-hidden"
        style={{ height: minimized ? 0 : isYouTube ? undefined : link.embedHeight ?? 152 }}
      >
        <iframe
          key={track.id}
          ref={iframeRef}
          src={src}
          title={track.title}
          onLoad={handleLoad}
          className={`w-full block ${isYouTube ? "aspect-video" : "h-full"}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {!minimized && track.descriptionHtml && (
        <div
          className="rich-content text-xs text-gray-600 px-4 pt-3 max-h-24 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: track.descriptionHtml }}
        />
      )}

      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center">
          <button type="button" onClick={onPrev ?? undefined} disabled={!onPrev} className={iconBtn} aria-label="Previous track" title="Previous">
            <SkipBack className="h-4 w-4" />
          </button>
          <button type="button" onClick={onNext ?? undefined} disabled={!onNext} className={iconBtn} aria-label="Next track" title="Next">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <ShareButton copied={copied} onShare={onShare} title={track.title} />
          <a
            href={link.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {providerLabel(link.provider)}
          </a>
        </div>
      </div>
    </div>
  );
}
