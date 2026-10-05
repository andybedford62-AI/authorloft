/** Client helper for POST /api/admin/music/move-tracks, shared by the album
 *  editor's "Move to…" menu and the Organize tracks page. */
export type MoveResult = { ok: true } | { ok: false; cancelled?: boolean; error: string };

export async function moveTracksRequest(
  lessonIds: string[],
  toListId: string,
  toListTitle: string
): Promise<MoveResult> {
  const send = async (onDuplicate?: "allow") => {
    const res = await fetch("/api/admin/music/move-tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds, toListId, onDuplicate }),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  try {
    let { res, data } = await send();
    if (res.status === 409) {
      const names: string[] = data.duplicates ?? [];
      const ok = confirm(
        `"${toListTitle}" already has ${names.join(", ")}.\n\nMove it anyway? It would appear twice in that list. Cancel leaves it where it is.`
      );
      if (!ok) return { ok: false, cancelled: true, error: "" };
      ({ res, data } = await send("allow"));
    }
    if (!res.ok) return { ok: false, error: data?.error || "Could not move the track." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not move the track." };
  }
}
