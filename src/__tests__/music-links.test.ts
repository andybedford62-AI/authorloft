// @vitest-environment node
import { describe, it, expect } from "vitest";
import { resolveTrackLink, parseOpenGraph, providerLabel, parsePastedTracks } from "@/lib/music-links";

describe("resolveTrackLink — YouTube", () => {
  it("embeds every single-video URL shape via the no-cookie host", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=mL9GwACO8hY",
      "https://youtube.com/watch?v=mL9GwACO8hY&list=PLabc&index=2",
      "https://youtu.be/mL9GwACO8hY",
      "https://m.youtube.com/watch?v=mL9GwACO8hY",
      "https://www.youtube.com/shorts/mL9GwACO8hY",
      "https://www.youtube-nocookie.com/embed/mL9GwACO8hY",
    ]) {
      const r = resolveTrackLink(url)!;
      expect(r.provider).toBe("youtube");
      expect(r.mode).toBe("embed");
      expect(r.embedUrl).toBe("https://www.youtube-nocookie.com/embed/mL9GwACO8hY");
    }
  });

  it("falls back to a link card for a channel page with no video id", () => {
    const r = resolveTrackLink("https://www.youtube.com/@andybedford62")!;
    expect(r.provider).toBe("youtube");
    expect(r.mode).toBe("link");
    expect(r.embedUrl).toBeNull();
  });
});

describe("resolveTrackLink — Spotify", () => {
  it("rewrites each content type to its embed URL", () => {
    const track = resolveTrackLink("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")!;
    expect(track.mode).toBe("embed");
    expect(track.embedUrl).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(track.embedHeight).toBe(152); // compact bar for a single track

    const album = resolveTrackLink("https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3")!;
    expect(album.embedUrl).toContain("/embed/album/");
    expect(album.embedHeight).toBe(352); // collections need room for a list
  });

  it("handles localised /intl-xx/ paths and strips query junk", () => {
    const r = resolveTrackLink("https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123")!;
    expect(r.embedUrl).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(r.canonicalUrl).toBe("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
  });
});

describe("resolveTrackLink — Suno", () => {
  it("is never embedded, because Suno sends frame-ancestors 'none'", () => {
    // Verified against a live share URL: CSP frame-ancestors 'none' plus
    // X-Frame-Options SAMEORIGIN. Embedding it would render a blank box no
    // matter what our own CSP allows.
    const r = resolveTrackLink("https://suno.com/s/3lAosk9lDWkrUvDr")!;
    expect(r.provider).toBe("suno");
    expect(r.mode).toBe("link");
    expect(r.embedUrl).toBeNull();
    expect(r.canonicalUrl).toBe("https://suno.com/s/3lAosk9lDWkrUvDr");
  });
});

describe("resolveTrackLink — unknown and invalid input", () => {
  it("degrades an unknown host to a link card rather than rejecting it", () => {
    const r = resolveTrackLink("https://bandcamp.com/track/whatever")!;
    expect(r.provider).toBe("other");
    expect(r.mode).toBe("link");
    expect(providerLabel(r.provider)).toBe("the artist's page");
  });

  it("rejects anything that isn't a usable https URL", () => {
    expect(resolveTrackLink("")).toBeNull();
    expect(resolveTrackLink("   ")).toBeNull();
    expect(resolveTrackLink("not a url")).toBeNull();
    // http would be blocked as mixed content on our https pages
    expect(resolveTrackLink("http://open.spotify.com/track/abc")).toBeNull();
    expect(resolveTrackLink("javascript:alert(1)")).toBeNull();
  });

  it("never returns an embedUrl when mode is link", () => {
    for (const url of [
      "https://suno.com/s/3lAosk9lDWkrUvDr",
      "https://bandcamp.com/track/x",
      "https://www.youtube.com/@someone",
    ]) {
      const r = resolveTrackLink(url)!;
      expect(r.mode).toBe("link");
      expect(r.embedUrl).toBeNull();
    }
  });
});

describe("parseOpenGraph", () => {
  it("reads the tags Suno actually serves", () => {
    // Copied from a live fetch of a Suno share page.
    const html = `<meta property="og:title" content="Alabama Autumn"/>
      <meta property="og:description" content="Listen and make your own on Suno."/>
      <meta property="og:image" content="https://cdn2.suno.ai/image_large_ea3585b6.jpeg"/>`;
    expect(parseOpenGraph(html)).toEqual({
      title: "Alabama Autumn",
      thumbnailUrl: "https://cdn2.suno.ai/image_large_ea3585b6.jpeg",
    });
  });

  it("handles reversed attribute order, name= instead of property=, and entities", () => {
    const html = `<meta content="Rock &amp; Roll" property="og:title">
      <meta name="twitter:image" content="https://example.com/a.jpg">`;
    expect(parseOpenGraph(html)).toEqual({
      title: "Rock & Roll",
      thumbnailUrl: "https://example.com/a.jpg",
    });
  });

  it("returns nulls rather than throwing when there are no tags", () => {
    expect(parseOpenGraph("<html><body>nothing</body></html>")).toEqual({
      title: null,
      thumbnailUrl: null,
    });
  });
});

describe("parsePastedTracks", () => {
  it("takes one bare link per line and ignores blanks and comments", () => {
    const { tracks, invalidLines } = parsePastedTracks(
      "https://youtu.be/mL9GwACO8hY\n\n# a comment\n   \nhttps://suno.com/s/3lAosk9lDWkrUvDr"
    );
    expect(tracks.map((t) => t.url)).toEqual([
      "https://www.youtube.com/watch?v=mL9GwACO8hY",
      "https://suno.com/s/3lAosk9lDWkrUvDr",
    ]);
    expect(invalidLines).toEqual([]);
  });

  it("accepts a spreadsheet paste, which arrives tab-separated", () => {
    // Copying cells out of Excel or Google Sheets produces exactly this, so a
    // spreadsheet works with no CSV export and no column mapping.
    const { tracks } = parsePastedTracks(
      "https://suno.com/s/abc123defg\tAlabama Autumn\tWritten after the storm"
    );
    expect(tracks[0].title).toBe("Alabama Autumn");
    expect(tracks[0].description).toBe("Written after the storm");
  });

  it("accepts comma and pipe separators too", () => {
    const { tracks } = parsePastedTracks(
      "https://youtu.be/mL9GwACO8hY, Home to You, Closing track\n" +
      "https://youtu.be/OxfoI2OslBY | Looking For You | County fair"
    );
    expect(tracks[0]).toMatchObject({ title: "Home to You", description: "Closing track" });
    expect(tracks[1]).toMatchObject({ title: "Looking For You", description: "County fair" });
  });

  it("keeps commas inside the note by splitting only three fields", () => {
    const { tracks } = parsePastedTracks(
      "https://youtu.be/mL9GwACO8hY, Home to You, Recorded live, mixed later"
    );
    expect(tracks[0].description).toBe("Recorded live, mixed later");
  });

  it("normalises each link to its canonical form", () => {
    const { tracks } = parsePastedTracks(
      "https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT?si=xyz"
    );
    expect(tracks[0].url).toBe("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
  });

  it("reports unusable lines instead of dropping them silently", () => {
    const { tracks, invalidLines } = parsePastedTracks(
      "https://youtu.be/mL9GwACO8hY\njust some text\nhttp://insecure.example/x"
    );
    expect(tracks).toHaveLength(1);
    expect(invalidLines).toEqual(["just some text", "http://insecure.example/x"]);
  });

  it("handles Windows line endings", () => {
    const { tracks } = parsePastedTracks(
      "https://youtu.be/mL9GwACO8hY\r\nhttps://youtu.be/OxfoI2OslBY"
    );
    expect(tracks).toHaveLength(2);
  });

  it("returns nothing for empty input", () => {
    expect(parsePastedTracks("").tracks).toEqual([]);
    expect(parsePastedTracks("   ").tracks).toEqual([]);
  });
});
