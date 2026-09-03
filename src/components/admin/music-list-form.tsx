"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check, Plus, Trash2, Loader2, AlertTriangle, GripVertical, ExternalLink, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverUpload } from "@/components/admin/cover-upload";
import { resolveTrackLink, providerLabel } from "@/lib/music-links";

// Button/icon standard: Check = Save/Update, Plus = Create/Add, Trash2 =
// Delete, ghost = Cancel.

type TrackRow = { url: string; title: string; description: string; originalHtml: string };

interface Props {
  /** Absent when creating. */
  listId?: string;
  initial?: {
    title: string;
    description: string;
    coverImageUrl: string;
    isPublished: boolean;
    isFeatured: boolean;
    tracks: TrackRow[];
  };
  /** Plan cap on tracks; null = unlimited. */
  trackCap: number | null;
}

const blankTrack = (): TrackRow => ({ url: "", title: "", description: "", originalHtml: "" });

const inputClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function MusicListForm({ listId, initial, trackCap }: Props) {
  const router = useRouter();
  const isEdit = !!listId;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [tracks, setTracks] = useState<TrackRow[]>(initial?.tracks ?? [blankTrack()]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const atCap = trackCap !== null && tracks.length >= trackCap;

  function updateTrack(i: number, patch: Partial<TrackRow>) {
    setTracks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function move(i: number, dir: -1 | 1) {
    setTracks((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setWarnings([]);
    try {
      const payload = {
        title,
        description,
        coverImageUrl,
        isPublished,
        isFeatured,
        tracks: tracks.filter((t) => t.url.trim()),  // description + originalHtml ride along
      };
      const res = await fetch(isEdit ? `/api/admin/music/${listId}` : "/api/admin/music", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not save.");
      if (data.warnings?.length) setWarnings(data.warnings);
      else {
        router.push("/admin/music");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!listId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/music/${listId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete.");
      router.push("/admin/music");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Music List / Album Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Songs for the Road" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
        </div>
        {/* Same uploader the course editor uses: drag-and-drop or file picker,
            with a paste-a-URL option behind the link button. Shown on the music
            index card and at the top of the list's public page. */}
        <CoverUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          label="Cover / Banner Image"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-gray-300" />
          Published (visible on your public Music page)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-gray-300" />
          Featured (shown as the hero highlight when your homepage focus is set to Music)
        </label>
        {!isPublished && (
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
            <EyeOff className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              This is a draft — readers won&apos;t see it. Check <strong>Published</strong> above
              and save to make it appear on your public Music page.
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-900">Tracks</h2>
          <span className="text-xs text-gray-400">
            {tracks.length}{trackCap !== null ? ` / ${trackCap}` : ""}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Paste a public link — YouTube and Spotify play inline; Suno and other sites open in a new tab.
          Leave the title blank to use the one from the linked page.
        </p>

        <div className="space-y-3">
          {tracks.map((track, i) => {
            const link = track.url.trim() ? resolveTrackLink(track.url.trim()) : null;
            const invalid = track.url.trim() !== "" && link === null;
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="flex flex-col pt-2 text-gray-300">
                  <button type="button" onClick={() => move(i, -1)} className="hover:text-gray-600 leading-none" title="Move up">▲</button>
                  <GripVertical className="h-3 w-3 my-0.5" />
                  <button type="button" onClick={() => move(i, 1)} className="hover:text-gray-600 leading-none" title="Move down">▼</button>
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    value={track.url}
                    onChange={(e) => updateTrack(i, { url: e.target.value })}
                    className={inputClass}
                    placeholder="https://open.spotify.com/track/… or https://youtu.be/…"
                  />
                  <input
                    value={track.title}
                    onChange={(e) => updateTrack(i, { title: e.target.value })}
                    className={inputClass}
                    placeholder="Track title (optional)"
                  />
                  <textarea
                    value={track.description}
                    onChange={(e) => updateTrack(i, { description: e.target.value })}
                    rows={2}
                    className={inputClass}
                    placeholder="Short note about this track (optional)"
                  />
                  {invalid && (
                    <p className="text-xs text-red-600">Not a usable https link.</p>
                  )}
                  {link && (
                    <p className="text-xs text-gray-500">
                      {providerLabel(link.provider)} — {link.mode === "embed" ? "plays inline" : "opens in a new tab"}
                      <a href={link.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 underline">
                        preview <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </div>
                <Button type="button" variant="ghost" onClick={() => setTracks((p) => p.filter((_, idx) => idx !== i))} title="Remove track">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={atCap}
          onClick={() => setTracks((p) => [...p, blankTrack()])}
        >
          <Plus className="h-4 w-4 mr-2" /> Add track
        </Button>
        {atCap && (
          <p className="text-xs text-amber-700 mt-2">
            Your plan allows {trackCap} tracks per list.{" "}
            <Link href="/admin/settings" className="underline">Upgrade</Link> for more.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 space-y-1">
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
          <Link href="/admin/music" className="underline font-medium">Back to Music</Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" onClick={handleSave} disabled={saving || !title.trim()}>
          {saving
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
            : isEdit
              ? <><Check className="h-4 w-4 mr-2" />Save changes</>
              : <><Plus className="h-4 w-4 mr-2" />Create Music List / Album</>}
        </Button>
        {isEdit && (
          <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" /> {deleting ? "Deleting…" : "Delete list"}
          </Button>
        )}
      </div>
    </div>
  );
}
