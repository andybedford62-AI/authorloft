"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Check, Plus, Trash2, Loader2, AlertTriangle, GripVertical, ExternalLink, EyeOff, HelpCircle, Store, Lock,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Music2, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverUpload } from "@/components/admin/cover-upload";
import { MusicHelpModal } from "@/components/admin/music-help-modal";
import { MusicNoSalesBanner } from "@/components/admin/music-no-sales-banner";
import { HelpTip } from "@/components/admin/help-tip";
import { resolveTrackLink, providerLabel, type ResolvedTrackLink } from "@/lib/music-links";
import { RELEASE_TYPES, MAX_LISTEN_LINKS, listenPlatform, type MusicReleaseType } from "@/lib/music-share";

// Button/icon standard: Check = Save/Update, Plus = Create/Add, Trash2 =
// Delete, ghost = Cancel.

/** What the edit page hands in; `uid` is added client-side. */
type InitialTrack = {
  url: string;
  title: string;
  description: string;
  originalHtml: string;
  /** Saved artwork, so link-card tracks (Suno etc.) show their art in the row. */
  thumbnailUrl?: string | null;
};

/** `uid` is a client-only stable key: rows reorder and expand independently,
 *  so the array index can't be the React key. Never sent to the API. */
type TrackRow = InitialTrack & { uid: string };

interface Props {
  /** Absent when creating. */
  listId?: string;
  initial?: {
    title: string;
    description: string;
    coverImageUrl: string;
    isPublished: boolean;
    isFeatured: boolean;
    listInBookstore: boolean;
    releaseType: MusicReleaseType;
    /** `YYYY-MM-DD` or "" */
    releaseDate: string;
    listenLinks: string[];
    tracks: InitialTrack[];
  };
  /** Plan cap on tracks; null = unlimited. */
  trackCap: number | null;
  /** STANDARD+ gate for the Bookstore opt-in toggle (mirrors CourseForm). */
  bookstoreEnabled?: boolean;
}

let uidSeq = 0;
const nextUid = () => `t${++uidSeq}`;
const blankTrack = (): TrackRow => ({ uid: nextUid(), url: "", title: "", description: "", originalHtml: "" });

/** Row artwork: saved thumbnail, else derived from a YouTube link as you type. */
function rowThumbnail(track: TrackRow, link: ResolvedTrackLink | null): string | null {
  if (link?.provider === "youtube" && link.embedUrl) {
    return `https://i.ytimg.com/vi/${link.embedUrl.split("/embed/")[1]}/mqdefault.jpg`;
  }
  return track.thumbnailUrl ?? null;
}

const inputClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function MusicListForm({ listId, initial, trackCap, bookstoreEnabled = false }: Props) {
  const router = useRouter();
  const isEdit = !!listId;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [listInBookstore, setListInBookstore] = useState(initial?.listInBookstore ?? false);
  const [releaseType, setReleaseType] = useState<MusicReleaseType>(initial?.releaseType ?? "PLAYLIST");
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? "");
  const [listenLinks, setListenLinks] = useState<string[]>(initial?.listenLinks ?? []);
  const [tracks, setTracks] = useState<TrackRow[]>(() =>
    initial?.tracks?.length ? initial.tracks.map((t) => ({ ...t, uid: nextUid() })) : [blankTrack()]
  );
  // Rows start collapsed so a 50-track list is scannable; empty rows (a new
  // list, or a freshly added track) open straight into editing.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(tracks.filter((t) => !t.url.trim()).map((t) => t.uid))
  );
  // Drag only arms from the grip handle, so selecting text inside an open
  // row's inputs never starts a drag by accident.
  const [armedUid, setArmedUid] = useState<string | null>(null);
  const dragUid = useRef<string | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const atCap = trackCap !== null && tracks.length >= trackCap;

  function updateTrack(i: number, patch: Partial<TrackRow>) {
    setTracks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function toggleExpanded(uid: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }
  function addTrack() {
    const t = blankTrack();
    setTracks((p) => [...p, t]);
    setExpanded((prev) => new Set(prev).add(t.uid));
  }
  function handleDragEnter(uid: string) {
    const from = dragUid.current;
    if (!from || from === uid) return;
    setTracks((prev) => {
      const list = [...prev];
      const a = list.findIndex((t) => t.uid === from);
      const b = list.findIndex((t) => t.uid === uid);
      if (a === -1 || b === -1) return prev;
      const [item] = list.splice(a, 1);
      list.splice(b, 0, item);
      return list;
    });
  }
  function endDrag() {
    dragUid.current = null;
    setDraggingUid(null);
    setArmedUid(null);
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
        listInBookstore,
        releaseType,
        releaseDate,
        listenLinks: listenLinks.map((l) => l.trim()).filter(Boolean),
        // description + originalHtml ride along; uid/thumbnailUrl are client-only.
        tracks: tracks
          .filter((t) => t.url.trim())
          .map(({ url, title, description, originalHtml }) => ({ url, title, description, originalHtml })),
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
    if (!confirm(`Delete "${title || "this music list"}" and all its tracks? This cannot be undone.`)) return;
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
      <MusicNoSalesBanner />
      <MusicHelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        How music lists work
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Music List / Album Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Songs for the Road" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Release Type</label>
          {/* Segmented rather than a <select>: four short options, and seeing
              them all at once explains what the field is for. */}
          <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-0.5" role="radiogroup" aria-label="Release type">
            {RELEASE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={releaseType === t.value}
                onClick={() => setReleaseType(t.value)}
                className={`px-3.5 py-1.5 text-sm rounded-md transition-colors ${
                  releaseType === t.value
                    ? "bg-white text-gray-900 font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Shown on your public page and in link previews, e.g. &ldquo;Album · 10 tracks&rdquo;.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Release Date <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className={`${inputClass} max-w-[12rem]`}
          />
          <p className="text-xs text-gray-400 mt-1">The year appears next to the release type on your public page.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Listen On <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Links to this whole {releaseType === "PLAYLIST" ? "playlist" : "release"} on Spotify, Apple Music,
            Bandcamp and so on. They show as &ldquo;Listen on&rdquo; buttons under the title.
          </p>
          <div className="space-y-2">
            {listenLinks.map((link, i) => {
              const trimmed = link.trim();
              let valid = false;
              try { valid = new URL(trimmed).protocol === "https:"; } catch { valid = false; }
              return (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={link}
                    onChange={(e) => setListenLinks((p) => p.map((l, idx) => (idx === i ? e.target.value : l)))}
                    className={inputClass}
                    placeholder="https://open.spotify.com/album/…"
                  />
                  <span className={`w-28 flex-shrink-0 text-xs truncate ${trimmed && !valid ? "text-red-600" : "text-gray-500"}`}>
                    {!trimmed ? "" : valid ? listenPlatform(trimmed) : "Needs https://"}
                  </span>
                  <Button type="button" variant="ghost" onClick={() => setListenLinks((p) => p.filter((_, idx) => idx !== i))} title="Remove link">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          {listenLinks.length < MAX_LISTEN_LINKS && (
            <Button type="button" variant="outline" className="mt-2" onClick={() => setListenLinks((p) => [...p, ""])}>
              <Plus className="h-4 w-4 mr-2" /> Add link
            </Button>
          )}
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

        {/* AuthorLoft Bookstore opt-in — edit mode only, mirrors CourseForm
            (a new list has no id yet, so there's nothing to list). */}
        {isEdit && (
          <div className="pt-2 border-t border-gray-100">
            {bookstoreEnabled ? (
              <>
                <div className="flex items-center gap-4 cursor-pointer select-none"
                  onClick={() => setListInBookstore((v) => !v)}>
                  <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${listInBookstore ? "bg-emerald-600" : "bg-gray-300"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${listInBookstore ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-emerald-600" />
                      List in AuthorLoft Bookstore
                    </p>
                    <p className="text-xs text-gray-400">
                      Feature this album/playlist in the public AuthorLoft Bookstore for cross-discovery. Listeners click through to this music list on your own site — no payment is taken there.
                    </p>
                  </div>
                </div>
                {listInBookstore && (
                  <div className="ml-14 mt-2 rounded-lg p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700">
                    Listed once this music list is <strong>Published</strong>. Make sure it has a cover image and description so it looks its best in the catalog.
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
                <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <span className="font-semibold">The AuthorLoft Bookstore requires a Standard plan or higher.</span>{" "}
                  <a href="/admin/settings#billing" className="underline hover:text-amber-900">Upgrade your plan</a> to list your music in the public bookstore for extra discovery.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-gray-900">Tracks</h2>
            <HelpTip id="music-first" />
          </div>
          <span className="text-xs text-gray-400">
            {tracks.length}{trackCap !== null ? ` / ${trackCap}` : ""}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Paste a public link — YouTube and Spotify play inline; Suno and other sites open in a new tab.
          Drag the handle to reorder; click a track to edit it.
        </p>

        {tracks.length > 1 && (
          <div className="flex justify-end gap-3 mb-2 text-xs">
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setExpanded(new Set(tracks.map((t) => t.uid)))}>
              Expand all
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setExpanded(new Set())}>
              Collapse all
            </button>
          </div>
        )}

        <ol className="space-y-2">
          {tracks.map((track, i) => {
            const link = track.url.trim() ? resolveTrackLink(track.url.trim()) : null;
            const invalid = track.url.trim() !== "" && link === null;
            const isOpen = expanded.has(track.uid);
            const thumb = rowThumbnail(track, link);
            return (
              <li
                key={track.uid}
                draggable={armedUid === track.uid}
                onDragStart={(e) => {
                  dragUid.current = track.uid;
                  setDraggingUid(track.uid);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnter={() => handleDragEnter(track.uid)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={endDrag}
                // Any press outside the handle disarms, so a press that started on
                // the handle but never became a drag can't leave the row draggable.
                onMouseDownCapture={(e) => {
                  if (!(e.target as HTMLElement).closest("[data-drag-handle]")) setArmedUid(null);
                }}
                className={`rounded-lg border bg-white transition-colors ${
                  draggingUid === track.uid ? "opacity-40 border-blue-300" : invalid ? "border-red-300" : "border-gray-200"
                }`}
              >
                {/* ── Compact row ─────────────────────────────────────────── */}
                <div className="flex items-center gap-2 p-2">
                  <span
                    data-drag-handle
                    onMouseDown={() => setArmedUid(track.uid)}
                    onMouseUp={() => setArmedUid(null)}
                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-0.5"
                    title="Drag to reorder"
                    aria-hidden
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="w-5 text-right text-xs font-medium text-gray-400 tabular-nums flex-shrink-0">{i + 1}</span>
                  <div className="relative w-16 h-9 rounded bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {/* next/image, not a raw <img>: it's fetched via /_next/image on
                        our own origin, so the CSP img-src (which doesn't list
                        i.ytimg.com, Spotify or Suno hosts) doesn't block it —
                        same route the public track cards use. */}
                    {thumb ? (
                      <Image src={thumb} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <Music2 className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(track.uid)}
                    className="flex-1 min-w-0 text-left"
                    aria-expanded={isOpen}
                  >
                    <p className={`text-sm truncate ${track.title.trim() ? "text-gray-900 font-medium" : "text-gray-400 italic"}`}>
                      {track.title.trim() || (track.url.trim() ? "Title from link on save" : "New track — paste a link")}
                    </p>
                    <p className="text-xs truncate flex items-center gap-1.5">
                      {invalid ? (
                        <span className="text-red-600">Not a usable https link</span>
                      ) : link ? (
                        <span className="text-gray-500">
                          {providerLabel(link.provider)} · {link.mode === "embed" ? "plays inline" : "opens in new tab"}
                        </span>
                      ) : (
                        <span className="text-gray-400">No link yet</span>
                      )}
                      {track.description.trim() && (
                        <span className="inline-flex items-center gap-0.5 text-gray-400" title="Has a note">
                          <StickyNote className="h-3 w-3" /> note
                        </span>
                      )}
                    </p>
                  </button>
                  {/* Arrow buttons stay for keyboard and touch users — HTML5
                      drag-and-drop doesn't work on phones. */}
                  <div className="hidden sm:flex items-center">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up" aria-label={`Move track ${i + 1} up`}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === tracks.length - 1}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down" aria-label={`Move track ${i + 1} down`}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button type="button" onClick={() => toggleExpanded(track.uid)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    title={isOpen ? "Collapse" : "Edit"} aria-label={isOpen ? "Collapse track" : "Edit track"}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <Button type="button" variant="ghost" onClick={() => {
                    // Removing a filled-in track loses its link and note; a blank row doesn't need asking.
                    if (track.url.trim() && !confirm(`Remove "${track.title.trim() || "this track"}" from the list?`)) return;
                    setTracks((p) => p.filter((t) => t.uid !== track.uid));
                  }} title="Remove track">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* ── Expanded editor ─────────────────────────────────────── */}
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-gray-100">
                    <label className="block text-[11px] font-semibold text-gray-500 mt-1.5">Link</label>
                    <input
                      value={track.url}
                      onChange={(e) => updateTrack(i, { url: e.target.value })}
                      className={inputClass}
                      placeholder="https://open.spotify.com/track/… or https://youtu.be/…"
                      autoFocus={!track.url}
                    />
                    <label className="block text-[11px] font-semibold text-gray-500 pt-1">Title</label>
                    <input
                      value={track.title}
                      onChange={(e) => updateTrack(i, { title: e.target.value })}
                      className={inputClass}
                      placeholder="Optional — leave blank to use the linked page's title"
                    />
                    <label className="block text-[11px] font-semibold text-gray-500 pt-1">Note</label>
                    <textarea
                      value={track.description}
                      onChange={(e) => updateTrack(i, { description: e.target.value })}
                      rows={2}
                      className={inputClass}
                      placeholder="Short note about this track (optional)"
                    />
                    {link && (
                      <a href={link.canonicalUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 underline">
                        Preview on {providerLabel(link.provider)} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="flex sm:hidden gap-2 pt-1">
                      <Button type="button" variant="outline" onClick={() => move(i, -1)} disabled={i === 0}>
                        <ArrowUp className="h-3.5 w-3.5 mr-1" /> Up
                      </Button>
                      <Button type="button" variant="outline" onClick={() => move(i, 1)} disabled={i === tracks.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5 mr-1" /> Down
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={atCap}
          onClick={addTrack}
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
