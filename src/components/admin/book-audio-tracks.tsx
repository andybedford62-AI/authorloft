"use client";

import { useState, useEffect, useRef } from "react";
import {
  Music, Plus, Trash2, Loader2, UploadCloud, Link2,
  ChevronUp, ChevronDown, Pencil, Check, X, Lock,
  Play, Pause, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AudioTrack {
  id:              string;
  title:           string;
  description:     string | null;
  url:             string;
  fileKey:         string | null;
  mimeType:        string | null;
  durationSeconds: number | null;
  sortOrder:       number;
  isActive:        boolean;
}

interface Props {
  bookId:       string;
  audioEnabled: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Mini preview player ───────────────────────────────────────────────────────

function MiniPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else         { el.play();  setPlaying(true);  }
  }

  // pause when unmounted
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <button
        type="button"
        onClick={toggle}
        className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors flex-shrink-0"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]" title={url}>
        {url.split("/").pop()}
      </span>
    </div>
  );
}

// ── Add Track form ────────────────────────────────────────────────────────────

interface AddTrackFormProps {
  bookId:   string;
  onSaved:  (track: AudioTrack) => void;
  onCancel: () => void;
}

function AddTrackForm({ bookId, onSaved, onCancel }: AddTrackFormProps) {
  const [mode, setMode]           = useState<"upload" | "url">("upload");
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [url, setUrl]             = useState("");
  const [fileKey, setFileKey]     = useState<string | null>(null);
  const [mimeType, setMimeType]   = useState<string | null>(null);
  const [durationSec, setDurSec]  = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res  = await fetch("/api/admin/upload/audio", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data.error ?? "Upload failed."); return; }
      setUrl(data.url);
      setFileKey(data.fileKey ?? null);
      setMimeType(data.mimeType ?? null);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      setUploadErr("Network error — upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Please enter a track title."); return; }
    if (!url.trim())   { setError("Please upload a file or enter a URL."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/audio`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description, url, fileKey, mimeType,
                                  durationSeconds: durationSec || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); setSaving(false); return; }
      onSaved(data);
    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
        <Music className="h-4 w-4 text-blue-500" />
        Add Audio Track
      </h3>

      {/* Source toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        {(["upload", "url"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setUrl(""); setFileKey(null); setMimeType(null); }}
            className={`px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "upload" ? <UploadCloud className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {m === "upload" ? "Upload file" : "Paste URL"}
          </button>
        ))}
      </div>

      {/* Upload */}
      {mode === "upload" && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.mp4,.m4a,.wav,.ogg,.flac,.aac"
            className="hidden"
            onChange={handleFile}
          />
          {url ? (
            <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-3 py-2.5">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <MiniPlayer url={url} />
              <button
                type="button"
                onClick={() => { setUrl(""); setFileKey(null); setMimeType(null); }}
                className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-blue-200 rounded-xl py-6 text-sm text-gray-500 hover:border-blue-400 hover:text-gray-700 transition-colors bg-white disabled:opacity-60"
            >
              {uploading
                ? <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                : <UploadCloud className="h-6 w-6 text-blue-300" />}
              <span>
                {uploading ? "Uploading…" : "Click to upload MP3, MP4, WAV, M4A, OGG, FLAC"}
              </span>
              <span className="text-xs text-gray-400">Max 100 MB</span>
            </button>
          )}
          {uploadErr && <p className="text-xs text-red-600">{uploadErr}</p>}
        </div>
      )}

      {/* URL input */}
      {mode === "url" && (
        <Input
          label="Audio URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/audio/narration.mp3"
          hint="Direct link to an MP3, MP4, WAV, or other audio file"
        />
      )}

      {/* Title */}
      <Input
        label="Track Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Chapter 1 Excerpt, Author Narration"
        required
      />

      {/* Description (optional) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Short description of this audio clip…"
          rows={2}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Duration (optional) */}
      <Input
        label="Duration (optional)"
        type="number"
        min="0"
        value={durationSec}
        onChange={(e) => setDurSec(e.target.value)}
        placeholder="Length in seconds, e.g. 183"
        hint="Displayed as a time badge (e.g. 3:03). Leave blank if unknown."
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {saving ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving…</> : "Save Track"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Edit inline form ──────────────────────────────────────────────────────────

interface EditInlineProps {
  track:    AudioTrack;
  bookId:   string;
  onSaved:  (updated: AudioTrack) => void;
  onCancel: () => void;
}

function EditInlineForm({ track, bookId, onSaved, onCancel }: EditInlineProps) {
  const [title, setTitle]      = useState(track.title);
  const [description, setDesc] = useState(track.description ?? "");
  const [durationSec, setDur]  = useState(track.durationSeconds?.toString() ?? "");
  const [saving, setSaving]    = useState(false);
  const [error, setError]      = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/books/${bookId}/audio/${track.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title, description, durationSeconds: durationSec || null }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Save failed."); setSaving(false); return; }
    onSaved(data);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 py-2">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>
      <Input
        label="Duration (seconds)"
        type="number"
        min="0"
        value={durationSec}
        onChange={(e) => setDur(e.target.value)}
        placeholder="e.g. 183"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BookAudioTracks({ bookId, audioEnabled }: Props) {
  const [tracks, setTracks]     = useState<AudioTrack[]>([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [deletingId, setDel]    = useState<string | null>(null);

  useEffect(() => {
    if (!audioEnabled) { setLoading(false); return; }
    fetch(`/api/admin/books/${bookId}/audio`)
      .then((r) => r.json())
      .then((data) => setTracks(Array.isArray(data) ? data : []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [bookId, audioEnabled]);

  async function handleDelete(trackId: string) {
    if (!confirm("Delete this audio track? This cannot be undone.")) return;
    setDel(trackId);
    await fetch(`/api/admin/books/${bookId}/audio/${trackId}`, { method: "DELETE" });
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setDel(null);
  }

  async function handleToggleActive(track: AudioTrack) {
    const res = await fetch(`/api/admin/books/${bookId}/audio/${track.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !track.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTracks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    }
  }

  async function handleReorder(trackId: string, direction: "up" | "down") {
    const idx = tracks.findIndex((t) => t.id === trackId);
    if (direction === "up"   && idx === 0)                 return;
    if (direction === "down" && idx === tracks.length - 1) return;

    const swapIdx  = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = [...tracks];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setTracks(newOrder);

    // Persist new sort orders
    await Promise.all(
      newOrder.map((t, i) =>
        fetch(`/api/admin/books/${bookId}/audio/${t.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sortOrder: i }),
        })
      )
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
          <Volume2 className="h-4.5 w-4.5 text-purple-500" style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900">Audio Previews</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Add narrations, chapter excerpts, or author notes. Readers will see an inline player on your book page.
          </p>
        </div>
        {audioEnabled && !adding && (
          <Button
            type="button"
            size="sm"
            onClick={() => setAdding(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Track
          </Button>
        )}
      </div>

      {/* Plan gate */}
      {!audioEnabled && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">Audio previews require a Standard or Premium plan.</span>{" "}
            <a href="/admin/settings" className="underline hover:text-amber-900">Upgrade your plan</a> to
            add audio tracks to your books.
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <AddTrackForm
          bookId={bookId}
          onSaved={(t) => { setTracks((prev) => [...prev, t]); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Loading */}
      {audioEnabled && loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tracks…
        </div>
      )}

      {/* Empty state */}
      {audioEnabled && !loading && tracks.length === 0 && !adding && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <Music className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No audio tracks yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add narrations, excerpts, or author notes for your readers to listen to.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2"
          >
            Add your first track
          </button>
        </div>
      )}

      {/* Track list */}
      {audioEnabled && !loading && tracks.length > 0 && (
        <div className="space-y-3">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className={`border rounded-xl p-4 transition-colors ${
                track.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              {editId === track.id ? (
                <EditInlineForm
                  track={track}
                  bookId={bookId}
                  onSaved={(updated) => {
                    setTracks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
                    setEditId(null);
                  }}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 pt-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReorder(track.id, "up")}
                      disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(track.id, "down")}
                      disabled={idx === tracks.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Track icon */}
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Music className="h-4 w-4 text-purple-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{track.title}</span>
                      {track.durationSeconds && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                          {formatDuration(track.durationSeconds)}
                        </span>
                      )}
                      {!track.isActive && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    {track.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">{track.description}</p>
                    )}
                    <MiniPlayer url={track.url} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(track)}
                      title={track.isActive ? "Hide from public" : "Show on public page"}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {track.isActive
                        ? <Volume2 className="h-3.5 w-3.5" />
                        : <Volume2 className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(track.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(track.id)}
                      disabled={deletingId === track.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deletingId === track.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
