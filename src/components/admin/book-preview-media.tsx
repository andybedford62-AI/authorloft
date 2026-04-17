"use client";

import { useState, useRef } from "react";
import { ImageIcon, Video, Music, UploadCloud, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

interface PreviewMedia {
  id:               string;
  position:         number;
  mediaType:        MediaType;
  fileUrl:          string;
  fileKey:          string | null;
  thumbnailUrl:     string | null;
  thumbnailFileKey: string | null;
}

interface Props {
  bookId: string;
  initial: PreviewMedia[];
}

// ── Slot component ────────────────────────────────────────────────────────────

function MediaSlot({
  bookId,
  position,
  media,
  onSave,
  onDelete,
}: {
  bookId:   string;
  position: number;
  media:    PreviewMedia | null;
  onSave:   (m: PreviewMedia) => void;
  onDelete: (position: number) => void;
}) {
  const [uploading, setUploading]   = useState<"media" | "thumbnail" | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const mediaInputRef               = useRef<HTMLInputElement>(null);
  const thumbInputRef               = useRef<HTMLInputElement>(null);

  const mediaType: MediaType = media?.mediaType ?? "IMAGE";
  const needsPoster           = mediaType === "VIDEO" || mediaType === "AUDIO";

  async function uploadFile(file: File, slot: "media" | "thumbnail") {
    setUploading(slot);
    try {
      const fd = new FormData();
      fd.append("bookId",   bookId);
      fd.append("position", String(position));
      fd.append("slot",     slot);
      fd.append("file",     file);

      const res  = await fetch("/api/admin/upload/book-preview", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onSave(json.record as PreviewMedia);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleDelete() {
    if (!media) return;
    if (!confirm("Remove this preview slot?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/book-preview/${media.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(position);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function handleRemovePoster() {
    if (!media) return;
    const res = await fetch(`/api/admin/book-preview/${media.id}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      onSave(updated as PreviewMedia);
    }
  }

  const thumbnailSrc = media?.thumbnailUrl ?? (media?.mediaType === "IMAGE" ? media.fileUrl : null);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Preview area */}
      <div className="relative bg-gray-100 flex items-center justify-center" style={{ height: 140 }}>
        {thumbnailSrc ? (
          <Image src={thumbnailSrc} alt="" fill className="object-cover" />
        ) : media?.mediaType === "VIDEO" ? (
          <Video className="w-10 h-10 text-gray-400" />
        ) : media?.mediaType === "AUDIO" ? (
          <Music className="w-10 h-10 text-gray-400" />
        ) : (
          <ImageIcon className="w-10 h-10 text-gray-300" />
        )}

        {/* Delete button */}
        {media && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <X className="w-4 h-4 text-gray-500" />}
          </button>
        )}

        {/* Media type badge */}
        {media && (
          <span className="absolute bottom-1 left-1 text-[10px] font-medium uppercase tracking-wide bg-black/50 text-white px-1.5 py-0.5 rounded">
            {media.mediaType}
          </span>
        )}
      </div>

      {/* Upload controls */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slot {position}</p>

        {/* Main media upload */}
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,audio/mpeg"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "media"); e.target.value = ""; }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={!!uploading}
          onClick={() => mediaInputRef.current?.click()}
        >
          {uploading === "media" ? (
            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading…</>
          ) : (
            <><UploadCloud className="w-3 h-3 mr-1" />{media ? "Replace Media" : "Upload Image / MP4 / MP3"}</>
          )}
        </Button>

        {/* Poster image upload — only shown for video/audio slots */}
        {needsPoster && (
          <>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "thumbnail"); e.target.value = ""; }}
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={!!uploading}
                onClick={() => thumbInputRef.current?.click()}
              >
                {uploading === "thumbnail" ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading…</>
                ) : (
                  <><ImageIcon className="w-3 h-3 mr-1" />{media?.thumbnailUrl ? "Replace Poster" : "Upload Poster"}</>
                )}
              </Button>
              {media?.thumbnailUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemovePoster}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BookPreviewMedia({ bookId, initial }: Props) {
  const [slots, setSlots] = useState<(PreviewMedia | null)[]>(() => {
    const arr: (PreviewMedia | null)[] = [null, null, null];
    for (const m of initial) {
      if (m.position >= 1 && m.position <= 3) arr[m.position - 1] = m;
    }
    return arr;
  });

  function handleSave(media: PreviewMedia) {
    setSlots(prev => prev.map((s, i) => (i === media.position - 1 ? media : s)));
  }

  function handleDelete(position: number) {
    setSlots(prev => prev.map((s, i) => (i === position - 1 ? null : s)));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Preview Media</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Up to 3 preview images, videos (MP4), or audio (MP3) shown on the public book page.
          Video and audio slots require a poster image for the thumbnail.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slots.map((media, i) => (
          <MediaSlot
            key={i}
            bookId={bookId}
            position={i + 1}
            media={media}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
