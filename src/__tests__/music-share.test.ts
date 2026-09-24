import { describe, it, expect } from "vitest";
import {
  trackKeys, findTrackIndex, releaseLabel, taggedUrl, shareIntentUrl,
  listenPlatform, parseListenLinks, parseReleaseDate,
} from "@/lib/music-share";

describe("trackKeys", () => {
  it("uses title slugs so links survive reorders and re-saves", () => {
    expect(trackKeys(["Road Song", "Night Drive"])).toEqual(["road-song", "night-drive"]);
  });

  it("falls back to position for repeated or empty titles", () => {
    expect(trackKeys(["Intro", "Intro", "!!!"])).toEqual(["1", "2", "3"]);
  });
});

describe("findTrackIndex", () => {
  const keys = ["road-song", "night-drive", "3"];
  it("resolves a key", () => expect(findTrackIndex(keys, "night-drive")).toBe(1));
  it("resolves a bare position", () => expect(findTrackIndex(keys, "1")).toBe(0));
  it("ignores unknown or out-of-range values", () => {
    expect(findTrackIndex(keys, "nope")).toBe(-1);
    expect(findTrackIndex(keys, "9")).toBe(-1);
    expect(findTrackIndex(keys, undefined)).toBe(-1);
  });
});

describe("releaseLabel", () => {
  it("treats a missing value as Playlist", () => {
    expect(releaseLabel(null)).toBe("Playlist");
    expect(releaseLabel("EP")).toBe("EP");
  });
});

describe("taggedUrl", () => {
  it("adds UTM tags and keeps an existing ?track=", () => {
    const u = new URL(taggedUrl("https://jo.authorloft.com/music/road?track=intro", "instagram", "road"));
    expect(u.searchParams.get("track")).toBe("intro");
    expect(u.searchParams.get("utm_source")).toBe("instagram");
    expect(u.searchParams.get("utm_campaign")).toBe("road");
  });
});

describe("shareIntentUrl", () => {
  it("encodes the shared URL", () => {
    expect(shareIntentUrl("facebook", "https://a.com/x?y=1", "hi")).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fa.com%2Fx%3Fy%3D1"
    );
  });
});

describe("listenPlatform", () => {
  it("names known platforms, incl. artist subdomains", () => {
    expect(listenPlatform("https://open.spotify.com/album/abc")).toBe("Spotify");
    expect(listenPlatform("https://music.youtube.com/playlist?list=x")).toBe("YouTube Music");
    expect(listenPlatform("https://jo.bandcamp.com/album/road")).toBe("Bandcamp");
  });
  it("falls back to the domain", () => {
    expect(listenPlatform("https://www.example.org/x")).toBe("example.org");
  });
});

describe("parseListenLinks", () => {
  it("keeps unique https URLs and drops junk", () => {
    expect(
      parseListenLinks(["https://a.com/x", "http://b.com", "nope", 3, "https://a.com/x"])
    ).toEqual(["https://a.com/x"]);
    expect(parseListenLinks("https://a.com")).toEqual([]);
  });
});

describe("parseReleaseDate", () => {
  it("parses YYYY-MM-DD as UTC, clears on empty, ignores malformed", () => {
    expect(parseReleaseDate("2026-03-03")?.toISOString()).toBe("2026-03-03T00:00:00.000Z");
    expect(parseReleaseDate("")).toBeNull();
    expect(parseReleaseDate("03/03/2026")).toBeUndefined();
    expect(parseReleaseDate(undefined)).toBeUndefined();
  });
});
