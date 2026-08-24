"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Youtube, Loader2, AlertTriangle, CheckCircle2, RotateCcw, Play, ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Paste a playlist, review the tracks, save as a music list. Preview comes from
// /api/admin/music/import-youtube; creation goes through the ordinary
// /api/admin/music POST, so limits, slug checks and metadata are unchanged.

type Step = "input" | "preview" | "done";

type PreviewTrack = { url: string; title: string; description: string };
type Preview = {
  title: string;
  description: string;
  tracks: PreviewTrack[];
  source: "api" | "rss";
  warnings: string[];
};

const inputClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function YouTubeMusicImportPanel({ atListLimit }: { atListLimit: boolean }) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [listTitle, setListTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedWarnings, setSavedWarnings] = useState<string[]>([]);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setFetching(true);
    setError("");
    try {
      const res = await fetch("/api/admin/music/import-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not fetch that playlist.");
      setPreview(data);
      setListTitle(data.title);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch that playlist.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listTitle.trim() || preview.title,
          description: preview.description,
          // Imported lists land unpublished, matching the courses importer —
          // the author reviews before anything goes public.
          isPublished: false,
          tracks: preview.tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not save.");
      setSavedWarnings([...preview.warnings, ...(data.warnings ?? [])]);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setStep("input");
    setUrl("");
    setPreview(null);
    setError("");
    setSavedWarnings([]);
  }

  return (
    <div className="space-y-4">
      {step === "input" && (
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-50 p-2 flex-shrink-0">
              <Youtube className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">
              Paste a public YouTube playlist and every video becomes a track — title and notes
              pre-filled, artwork included. Saved as a draft list for you to review.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=…"
              required
              className={inputClass}
            />
            <Button type="submit" disabled={fetching || atListLimit} className="flex-shrink-0">
              {fetching
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching…</>
                : "Fetch Playlist"}
            </Button>
          </div>

          {atListLimit && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                You&apos;ve reached your plan&apos;s music list limit.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to import more.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}

      {step === "preview" && preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">List title</label>
            <input value={listTitle} onChange={(e) => setListTitle(e.target.value)} className={inputClass} />
          </div>

          {preview.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}

          <div className="max-h-[22rem] overflow-auto rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              <ListMusic className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm truncate">{listTitle || preview.title}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {preview.tracks.length} track{preview.tracks.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-gray-50">
              {preview.tracks.map((t, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
                  <Play className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={reset} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving || preview.tracks.length === 0}>
              {saving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                : `Save ${preview.tracks.length} Track${preview.tracks.length === 1 ? "" : "s"} as Draft`}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Music list saved as a draft.</p>
              <p className="text-sm text-emerald-700 mt-1">
                Open it below to reorder tracks, edit notes, then publish when you&apos;re happy.
              </p>
            </div>
          </div>
          {savedWarnings.length > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
              {savedWarnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Import another playlist
          </Button>
        </div>
      )}
    </div>
  );
}
