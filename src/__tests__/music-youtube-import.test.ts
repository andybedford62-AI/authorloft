// The music importer maps a fetched playlist into the shape POST /api/admin/music
// takes. The fetch itself is covered by youtube-playlist-import.test.ts; this
// pins the mapping and the plan-cap slicing.
// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchPlaylist = vi.fn();
const canAddMusicList = vi.fn();
const maxTracksPerList = vi.fn();
const getAdminAuthorIdForApi = vi.fn();

vi.mock("@/lib/youtube-playlist", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/youtube-playlist")>();
  return { ...actual, fetchPlaylist: (...a: unknown[]) => fetchPlaylist(...a) };
});
vi.mock("@/lib/plan-limits", () => ({
  canAddMusicList: (...a: unknown[]) => canAddMusicList(...a),
  maxTracksPerList: (...a: unknown[]) => maxTracksPerList(...a),
}));
vi.mock("@/lib/admin-auth", () => ({
  getAdminAuthorIdForApi: (...a: unknown[]) => getAdminAuthorIdForApi(...a),
}));

import { POST } from "@/app/api/admin/music/import-youtube/route";

function req(url: string) {
  return new Request("https://x/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }) as never;
}

const PLAYLIST = "https://www.youtube.com/playlist?list=PLabc123_DEF456";

function playlistOf(n: number) {
  return {
    playlistTitle: "Road Songs",
    playlistDescription: "For long drives.",
    videos: Array.from({ length: n }, (_, i) => ({
      videoId: `vid${String(i).padStart(7, "0")}`,
      title: `Song ${i + 1}`,
      description: i === 0 ? "The first one." : null,
    })),
    source: "api" as const,
    warnings: [],
  };
}

describe("POST /api/admin/music/import-youtube", () => {
  beforeEach(() => {
    for (const m of [fetchPlaylist, canAddMusicList, maxTracksPerList, getAdminAuthorIdForApi]) m.mockReset();
    getAdminAuthorIdForApi.mockResolvedValue("author_1");
    canAddMusicList.mockResolvedValue({ allowed: true });
    maxTracksPerList.mockResolvedValue(null);
  });

  it("maps videos into watch URLs with titles and notes", async () => {
    fetchPlaylist.mockResolvedValue(playlistOf(2));
    const data = await (await POST(req(PLAYLIST))).json();

    expect(data.title).toBe("Road Songs");
    expect(data.description).toBe("For long drives.");
    expect(data.tracks).toEqual([
      { url: "https://www.youtube.com/watch?v=vid0000000", title: "Song 1", description: "The first one." },
      { url: "https://www.youtube.com/watch?v=vid0000001", title: "Song 2", description: "" },
    ]);
  });

  it("slices to the plan's track cap and says so", async () => {
    fetchPlaylist.mockResolvedValue(playlistOf(40));
    maxTracksPerList.mockResolvedValue(15);
    const data = await (await POST(req(PLAYLIST))).json();

    expect(data.tracks).toHaveLength(15);
    expect(data.warnings.join(" ")).toContain("15 tracks per list");
    expect(data.warnings.join(" ")).toContain("of 40");
  });

  it("refuses before fetching when the author is at their list limit", async () => {
    canAddMusicList.mockResolvedValue({ allowed: false, reason: "Plan limit reached." });
    const res = await POST(req(PLAYLIST));

    expect(res.status).toBe(403);
    expect(fetchPlaylist).not.toHaveBeenCalled(); // told before reviewing 40 tracks
  });

  it("rejects a link that isn't a playlist", async () => {
    const res = await POST(req("https://www.youtube.com/watch?v=abc12345678"));
    expect(res.status).toBe(400);
    expect(fetchPlaylist).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    getAdminAuthorIdForApi.mockResolvedValue(null);
    expect((await POST(req(PLAYLIST))).status).toBe(401);
  });

  it("passes the RSS truncation warning through", async () => {
    fetchPlaylist.mockResolvedValue({ ...playlistOf(15), source: "rss", warnings: ["Only 15 most recent."] });
    const data = await (await POST(req(PLAYLIST))).json();
    expect(data.source).toBe("rss");
    expect(data.warnings).toContain("Only 15 most recent.");
  });
});
