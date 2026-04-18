"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Play, Music } from "lucide-react";

type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

interface PreviewItem {
  id:           string;
  position:     number;
  mediaType:    MediaType;
  fileUrl:      string;
  thumbnailUrl: string | null;
}

interface Props {
  items:       PreviewItem[];
  accentColor: string;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  onClose,
}: {
  item:    PreviewItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div
        className="relative max-w-3xl w-full mx-4 rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {item.mediaType === "IMAGE" && (
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            <Image
              src={item.fileUrl}
              alt=""
              fill
              className="object-contain bg-black"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {item.mediaType === "VIDEO" && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={item.fileUrl}
            autoPlay
            controls
            playsInline
            className="w-full rounded-xl bg-black"
            style={{ maxHeight: "70vh" }}
          />
        )}

        {item.mediaType === "AUDIO" && (
          <div className="bg-gray-900 p-8 rounded-xl flex flex-col items-center gap-4">
            {item.thumbnailUrl && (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                <Image src={item.thumbnailUrl} alt="" fill className="object-cover" />
              </div>
            )}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio src={item.fileUrl} autoPlay controls className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Thumbnail card ────────────────────────────────────────────────────────────

function ThumbCard({
  item,
  accentColor,
  onClick,
}: {
  item:        PreviewItem;
  accentColor: string;
  onClick:     () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // For images use the file itself; for audio/video use the uploaded thumbnail if available.
  // Only fall back to <video> element for first-frame if no thumbnail was uploaded.
  const imageSrc =
    item.mediaType === "IMAGE" ? item.fileUrl :
    (item.thumbnailUrl ?? null); // audio & video both use thumbnailUrl when set

  const isVideo = item.mediaType === "VIDEO";
  const useVideoEmbed = isVideo && !item.thumbnailUrl; // only use <video> when no poster
  const hasPreview = isVideo || !!imageSrc;

  const playIcon  = <Play  className="w-8 h-8 text-white drop-shadow" fill="white" />;
  const musicIcon = <Music className="w-8 h-8 text-white drop-shadow" />;
  const overlayIcon =
    isVideo ? playIcon :
    item.mediaType === "AUDIO" && imageSrc ? musicIcon :
    null;

  return (
    <button
      type="button"
      className="relative w-full aspect-square rounded-lg overflow-visible focus:outline-none group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* ── Base thumbnail ─────────────────────────────────────────────────── */}
      <div
        className="w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-200 bg-gray-100 flex items-center justify-center relative"
        style={{ borderColor: hovered ? accentColor : "transparent" }}
      >
        {useVideoEmbed ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={item.fileUrl + "#t=0.001"}
            muted
            preload="metadata"
            playsInline
            className="w-full h-full object-cover"
          />
        ) : imageSrc ? (
          <Image src={imageSrc} alt="" fill className="object-cover" sizes="100px" />
        ) : (
          // Audio with no poster uploaded
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Music className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Play / audio overlay icon */}
        {overlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            {overlayIcon}
          </div>
        )}
      </div>

      {/* ── Hover popup — enlarged preview ────────────────────────────────── */}
      {hovered && hasPreview && (
        <div
          className="absolute z-20 rounded-xl overflow-hidden shadow-2xl border border-white/20 pointer-events-none"
          style={{
            width:  260,
            height: 195,
            bottom: "calc(100% + 8px)",
            left:   "50%",
            transform: "translateX(-50%)",
          }}
        >
          {useVideoEmbed ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={item.fileUrl + "#t=0.001"}
              muted
              preload="metadata"
              playsInline
              className="w-full h-full object-cover"
            />
          ) : imageSrc ? (
            <Image src={imageSrc} alt="" fill className="object-cover" sizes="220px" />
          ) : null}

          {overlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              {overlayIcon}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BookPreviewGallery({ items, accentColor }: Props) {
  const [active, setActive] = useState<PreviewItem | null>(null);

  if (!items.length) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 w-full mt-1">
        {items.map(item => (
          <ThumbCard
            key={item.id}
            item={item}
            accentColor={accentColor}
            onClick={() => setActive(item)}
          />
        ))}
      </div>

      {active && <Lightbox item={active} onClose={() => setActive(null)} />}
    </>
  );
}
