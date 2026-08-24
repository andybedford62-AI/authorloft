"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardPaste, Loader2, AlertTriangle, CheckCircle2, RotateCcw, Play, ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePastedTracks, resolveTrackLink, providerLabel } from "@/lib/music-links";

// Parsing happens live in the browser as you type, so the format rules are
// demonstrated rather than only described — a wrong line is visible before you
// commit to anything. Creation goes through the ordinary POST /api/admin/music.

const inputClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function MusicPastePanel({
  atListLimit,
  trackCap,
}: {
  atListLimit: boolean;
  trackCap: number | null;
}) {
  const [text, setText] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string[] | null>(null);

  const { tracks, invalidLines } = useMemo(() => parsePastedTracks(text), [text]);
  const overCap = trackCap !== null && tracks.length > trackCap;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listTitle.trim() || "Pasted Music List",
          isPublished: false, // lands as a draft, like the playlist importer
          tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not save.");
      setDone(data.warnings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
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
        {done.length > 0 && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
            {done.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}
        <Button type="button" variant="ghost" onClick={() => { setDone(null); setText(""); setListTitle(""); }}>
          <RotateCcw className="h-4 w-4 mr-2" /> Paste another list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-100 p-2 flex-shrink-0">
          <ClipboardPaste className="h-5 w-5 text-gray-600" />
        </div>
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">One link per line.</p>
          <p className="mt-1">
            To add a title and a note, put them after the link separated by a{" "}
            <strong>Tab</strong>, a <strong>comma</strong>, or a <strong>|</strong>:
          </p>
        </div>
      </div>

      {/* Showing the format beats describing it. */}
      <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto leading-relaxed">
{`https://youtu.be/mL9GwACO8hY
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT, Home to You
https://suno.com/s/3lAosk9lDWkrUvDr | Alabama Autumn | Written after the storm`}
      </pre>

      <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
        <li><strong>Title and note are optional</strong> — leave them off and we&apos;ll pull the title and artwork from the link.</li>
        <li><strong>Pasting from a spreadsheet works as-is.</strong> Copying cells from Excel or Google Sheets produces Tab-separated text, so link / title / note columns land in the right places — no CSV export needed.</li>
        <li>Commas inside a note are fine: only the first two separators are used.</li>
        <li>Blank lines and lines starting with <code>#</code> are ignored.</li>
        <li>Links must start with <code>https://</code>. YouTube and Spotify play inline; anything else becomes a card that opens in a new tab.</li>
      </ul>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">List title</label>
        <input
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Songs for the Road"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Links</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className={`${inputClass} font-mono text-xs`}
          placeholder="Paste your links here, one per line…"
        />
      </div>

      {tracks.length > 0 && (
        <div className="max-h-64 overflow-auto rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <ListMusic className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700">
              {tracks.length} track{tracks.length === 1 ? "" : "s"} recognised
            </span>
          </div>
          <ul className="divide-y divide-gray-50">
            {tracks.map((t, i) => {
              const link = resolveTrackLink(t.url);
              return (
                <li key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                  <Play className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  <span className="truncate text-gray-700">
                    {t.title || <span className="text-gray-400 italic">title from link</span>}
                  </span>
                  {link && (
                    <span className="ml-auto flex-shrink-0 text-gray-400">{providerLabel(link.provider)}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {invalidLines.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium mb-1">
            {invalidLines.length} line{invalidLines.length === 1 ? "" : "s"} had no usable https link and will be skipped:
          </p>
          <ul className="text-xs font-mono space-y-0.5">
            {invalidLines.slice(0, 5).map((l, i) => <li key={i} className="truncate">{l}</li>)}
            {invalidLines.length > 5 && <li>…and {invalidLines.length - 5} more</li>}
          </ul>
        </div>
      )}

      {overCap && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Your plan allows {trackCap} tracks per list — the first {trackCap} will be saved.{" "}
            <Link href="/admin/settings" className="underline font-medium">Upgrade</Link> for more.
          </span>
        </div>
      )}

      {atListLimit && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            You&apos;ve reached your plan&apos;s music list limit.{" "}
            <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to add more.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="button" onClick={handleSave} disabled={saving || tracks.length === 0 || atListLimit}>
        {saving
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          : `Save ${tracks.length || ""} Track${tracks.length === 1 ? "" : "s"} as Draft`.replace("  ", " ")}
      </Button>
    </div>
  );
}
