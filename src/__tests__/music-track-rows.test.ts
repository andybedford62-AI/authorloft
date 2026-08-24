// buildTrackRows is where a pasted list becomes database rows: it enforces the
// plan's track cap, drops unusable links, and fills missing titles from the
// linked page. Metadata fetching is mocked — the network behaviour is the
// concern of fetchTrackMetadata, not of this.
// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchTrackMetadata = vi.fn();

vi.mock("@/lib/music-links", async (importOriginal) => {
  // Keep the real resolveTrackLink — its provider rules are the thing that
  // decides which rows survive, so stubbing it would hollow out the test.
  const actual = await importOriginal<typeof import("@/lib/music-links")>();
  return { ...actual, fetchTrackMetadata: (...a: unknown[]) => fetchTrackMetadata(...a) };
});

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/admin-auth", () => ({ getAdminAuthorIdForApi: vi.fn() }));
vi.mock("@/lib/plan-limits", () => ({ canAddMusicList: vi.fn(), maxTracksPerList: vi.fn() }));

import { buildTrackRows } from "@/app/api/admin/music/route";

const YT = "https://www.youtube.com/watch?v=mL9GwACO8hY";
const SPOTIFY = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
const SUNO = "https://suno.com/s/3lAosk9lDWkrUvDr";

describe("buildTrackRows", () => {
  beforeEach(() => {
    fetchTrackMetadata.mockReset();
    fetchTrackMetadata.mockResolvedValue({ title: "Fetched Title", thumbnailUrl: "https://img/x.jpg" });
  });

  it("keeps the author's title but still stores fetched artwork", async () => {
    const { rows } = await buildTrackRows([{ url: YT, title: "  My Own Title  " }], null);
    expect(rows[0].title).toBe("My Own Title");
    expect(rows[0].thumbnailUrl).toBe("https://img/x.jpg");
  });

  it("falls back to the fetched title when none was typed", async () => {
    const { rows } = await buildTrackRows([{ url: SPOTIFY }], null);
    expect(rows[0].title).toBe("Fetched Title");
  });

  it("falls back to a positional name when neither is available", async () => {
    fetchTrackMetadata.mockResolvedValue({ title: null, thumbnailUrl: null });
    const { rows } = await buildTrackRows([{ url: SUNO }], null);
    expect(rows[0].title).toBe("Track 1");
    expect(rows[0].thumbnailUrl).toBeNull();
  });

  it("stores the canonical URL and sequential sortOrder", async () => {
    const { rows } = await buildTrackRows(
      [{ url: "https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT?si=x" }, { url: YT }],
      null,
    );
    expect(rows[0].videoUrl).toBe("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1]);
  });

  it("drops unusable links and reports how many", async () => {
    const { rows, skipped } = await buildTrackRows(
      [{ url: YT }, { url: "not a url" }, { url: "" }, { url: "http://insecure.example/x" }],
      null,
    );
    expect(rows).toHaveLength(1);
    expect(skipped).toBe(3);
  });

  it("enforces the plan cap and reports the overflow", async () => {
    const many = Array.from({ length: 20 }, () => ({ url: YT }));
    const { rows, trimmed } = await buildTrackRows(many, 15);
    expect(rows).toHaveLength(15);
    expect(trimmed).toBe(5);
  });

  it("treats a null cap as unlimited", async () => {
    const many = Array.from({ length: 60 }, () => ({ url: YT }));
    const { rows, trimmed } = await buildTrackRows(many, null);
    expect(rows).toHaveLength(60);
    expect(trimmed).toBe(0);
  });

  it("counts a trimmed-away bad link as trimmed, not skipped", async () => {
    // Cap applies before validation, so anything past the cap is never examined.
    const { rows, skipped, trimmed } = await buildTrackRows(
      [{ url: YT }, { url: "nonsense" }, { url: YT }],
      2,
    );
    expect(rows).toHaveLength(1); // first is valid, second invalid, third trimmed
    expect(skipped).toBe(1);
    expect(trimmed).toBe(1);
  });

  it("never issues a fetch for a link it discarded", async () => {
    await buildTrackRows([{ url: "not a url" }, { url: "javascript:alert(1)" }], null);
    expect(fetchTrackMetadata).not.toHaveBeenCalled();
  });
});

describe("buildTrackContentHtml — edits must not flatten a rich note", () => {
  it("keeps the original markup when the text is untouched", async () => {
    // Imported course lessons can carry an <img>; PATCH replaces every lesson
    // row, so without this an unrelated save would destroy the image.
    const original = '<img src="https://x/a.png" alt=""><p>Dedicated to the americans.</p>';
    const { buildTrackContentHtml } = await import("@/app/api/admin/music/route");
    expect(
      buildTrackContentHtml({ description: "Dedicated to the americans.", originalHtml: original })
    ).toBe(original);
  });

  it("writes escaped paragraphs once the author actually changes the text", async () => {
    const { buildTrackContentHtml } = await import("@/app/api/admin/music/route");
    expect(
      buildTrackContentHtml({ description: "New <b>note</b>", originalHtml: "<p>Old</p>" })
    ).toBe("<p>New &lt;b&gt;note&lt;/b&gt;</p>");
  });

  it("clears the note when the author empties the field", async () => {
    const { buildTrackContentHtml } = await import("@/app/api/admin/music/route");
    expect(buildTrackContentHtml({ description: "  ", originalHtml: "<p>Old</p>" })).toBeNull();
  });
});
