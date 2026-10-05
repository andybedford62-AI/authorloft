"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GripVertical, Music2, AlertTriangle, Loader2, Pencil } from "lucide-react";
import { releaseLabel } from "@/lib/music-share";
import { moveTracksRequest } from "@/lib/music-move-client";

type OrgTrack = { id: string; title: string; thumbnailUrl: string | null };
type OrgList = { id: string; title: string; releaseType: string | null; isPublished: boolean; tracks: OrgTrack[] };

export function MusicOrganizer({ initialLists, trackCap }: { initialLists: OrgList[]; trackCap: number | null }) {
  const [lists, setLists] = useState<OrgList[]>(initialLists);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [overListId, setOverListId] = useState<string | null>(null);
  const drag = useRef<{ trackId: string; fromListId: string } | null>(null);

  async function moveTrack(trackId: string, fromListId: string, toListId: string) {
    if (fromListId === toListId || busyId) return;
    const from = lists.find((l) => l.id === fromListId);
    const to = lists.find((l) => l.id === toListId);
    const track = from?.tracks.find((t) => t.id === trackId);
    if (!from || !to || !track) return;

    setBusyId(trackId);
    setMessage(null);
    const result = await moveTracksRequest([trackId], toListId, to.title);
    setBusyId(null);

    if (!result.ok) {
      if (!result.cancelled) setMessage({ kind: "error", text: result.error });
      return;
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === fromListId
          ? { ...l, tracks: l.tracks.filter((t) => t.id !== trackId) }
          : l.id === toListId
            ? { ...l, tracks: [...l.tracks, track] }
            : l
      )
    );
    setMessage({ kind: "ok", text: `Moved "${track.title}" to "${to.title}".` });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Drag a track onto another list, or use the &ldquo;Move to&rdquo; menu on its row. A moved track is added to the
        end of the new list and removed from the old one; its plays and likes go with it. Reorder within a list in that
        list&apos;s editor.
      </p>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            message.kind === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {message.kind === "error" && <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {lists.map((list) => {
          const full = trackCap !== null && list.tracks.length >= trackCap;
          const isOver = overListId === list.id && drag.current?.fromListId !== list.id;
          return (
            <section
              key={list.id}
              onDragOver={(e) => {
                if (!drag.current || drag.current.fromListId === list.id) return;
                e.preventDefault();
                setOverListId(list.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverListId((c) => (c === list.id ? null : c));
              }}
              onDrop={(e) => {
                e.preventDefault();
                const d = drag.current;
                drag.current = null;
                setOverListId(null);
                if (d) void moveTrack(d.trackId, d.fromListId, list.id);
              }}
              className={`rounded-xl border bg-white p-4 transition-colors ${
                isOver ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-300" : "border-gray-200"
              }`}
            >
              <header className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 truncate">{list.title}</h2>
                  <p className="text-xs text-gray-500">
                    {releaseLabel(list.releaseType)} · {list.tracks.length}
                    {trackCap !== null ? ` / ${trackCap}` : ""} track{list.tracks.length === 1 ? "" : "s"}
                    {!list.isPublished && " · draft"}
                    {full && <span className="text-amber-700"> · full</span>}
                  </p>
                </div>
                <Link
                  href={`/admin/music/${list.id}/edit`}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  title="Edit this list"
                  aria-label={`Edit ${list.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </header>

              {list.tracks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                  No tracks — drop one here
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {list.tracks.map((track) => (
                    <li
                      key={track.id}
                      draggable={!busyId}
                      onDragStart={(e) => {
                        drag.current = { trackId: track.id, fromListId: list.id };
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        drag.current = null;
                        setOverListId(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5 ${
                        busyId === track.id ? "opacity-50" : ""
                      }`}
                    >
                      <span className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500" aria-hidden>
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <div className="relative w-10 h-6 rounded bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {track.thumbnailUrl ? (
                          <Image src={track.thumbnailUrl} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <Music2 className="h-3 w-3 text-gray-300" />
                        )}
                      </div>
                      <span className="flex-1 min-w-0 truncate text-sm text-gray-800">{track.title}</span>
                      {busyId === track.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <select
                          aria-label={`Move ${track.title} to another list`}
                          value=""
                          onChange={(e) => void moveTrack(track.id, list.id, e.target.value)}
                          disabled={lists.length < 2}
                          className="max-w-[9rem] rounded-md border border-gray-200 bg-white py-1 pl-2 pr-6 text-xs text-gray-600"
                        >
                          <option value="">Move to…</option>
                          {lists
                            .filter((l) => l.id !== list.id)
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.title}
                              </option>
                            ))}
                        </select>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
