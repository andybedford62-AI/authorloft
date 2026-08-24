// Pure-logic layer of the YouTube playlist course import — URL parsing, RSS
// parsing, description escaping, and the mapping into MappedCourseImport.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import {
  extractPlaylistId,
  parsePlaylistRss,
  descriptionToHtml,
  playlistToCourse,
  type PlaylistFetchResult,
} from "@/lib/youtube-playlist";

describe("extractPlaylistId", () => {
  it("accepts the URL shapes people actually paste", () => {
    const id = "PLabc123_DEF-456xyz";
    expect(extractPlaylistId(`https://www.youtube.com/playlist?list=${id}`)).toBe(id);
    expect(extractPlaylistId(`https://youtube.com/playlist?list=${id}`)).toBe(id);
    expect(extractPlaylistId(`https://m.youtube.com/playlist?list=${id}`)).toBe(id);
    expect(extractPlaylistId(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${id}&index=3`)).toBe(id);
    expect(extractPlaylistId(`https://youtu.be/dQw4w9WgXcQ?list=${id}`)).toBe(id);
    expect(extractPlaylistId(id)).toBe(id); // bare id
    expect(extractPlaylistId(`  ${id}  `)).toBe(id); // whitespace
  });

  it("rejects what can never be fetched", () => {
    expect(extractPlaylistId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull(); // no list param
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=WL")).toBeNull();    // Watch Later
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=LL")).toBeNull();    // Liked
    expect(extractPlaylistId("https://www.youtube.com/watch?v=x&list=RDdQw4w9WgXcQabc")).toBeNull(); // auto mix
    expect(extractPlaylistId("https://vimeo.com/playlist?list=PLabc123_DEF456")).toBeNull(); // wrong host
    expect(extractPlaylistId("")).toBeNull();
    expect(extractPlaylistId("not a url at all!!")).toBeNull();
  });
});

describe("parsePlaylistRss", () => {
  const feed = `<?xml version="1.0"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Watercolor Basics &amp; Beyond</title>
  <entry>
    <yt:videoId>vid_one_0001</yt:videoId>
    <title>Lesson 1: Brushes &amp; Paper</title>
    <media:group><media:description>Pick your first kit.
Two lines here.</media:description></media:group>
  </entry>
  <entry>
    <yt:videoId>vid_two_0002</yt:videoId>
    <title>Lesson 2: Washes</title>
    <media:group><media:description></media:description></media:group>
  </entry>
</feed>`;

  it("extracts the playlist title and every entry", () => {
    const parsed = parsePlaylistRss(feed);
    expect(parsed.playlistTitle).toBe("Watercolor Basics & Beyond");
    expect(parsed.videos).toHaveLength(2);
    expect(parsed.videos[0]).toEqual({
      videoId: "vid_one_0001",
      title: "Lesson 1: Brushes & Paper",
      description: "Pick your first kit.\nTwo lines here.",
    });
    expect(parsed.videos[1].description).toBeNull();
  });

  it("returns no videos for a feed with no entries", () => {
    expect(parsePlaylistRss("<feed><title>Empty</title></feed>").videos).toHaveLength(0);
  });
});

describe("descriptionToHtml", () => {
  it("escapes markup so a description can never inject HTML", () => {
    const html = descriptionToHtml('Watch <script>alert("x")</script> & enjoy');
    expect(html).toBe("<p>Watch &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; enjoy</p>");
  });

  it("splits paragraphs on blank lines and keeps single breaks", () => {
    expect(descriptionToHtml("One\nstill one\n\nTwo")).toBe(
      "<p>One<br />still one</p>\n<p>Two</p>"
    );
  });

  it("returns null for empty input", () => {
    expect(descriptionToHtml(null)).toBeNull();
    expect(descriptionToHtml("   ")).toBeNull();
  });
});

describe("playlistToCourse", () => {
  const fetched: PlaylistFetchResult = {
    playlistTitle: "Sourdough From Scratch",
    playlistDescription: "Five sessions, one loaf.",
    videos: [
      { videoId: "abc12345678", title: "Starter Day 1", description: "Flour + water." },
      { videoId: "def12345678", title: "Shaping", description: null },
    ],
    source: "api",
    warnings: [],
  };

  it("maps to the exact shape POST /api/admin/courses/import accepts", () => {
    const course = playlistToCourse(fetched);
    expect(course.title).toBe("Sourdough From Scratch");
    expect(course.description).toBe("Five sessions, one loaf.");
    expect(course.categoryNames).toEqual([]); // curated taxonomy is match-only; playlists carry none
    expect(course.modules).toHaveLength(1);
    // Blank module title → the create route's "Module 1" default
    expect(course.modules[0].title).toBe("");
    expect(course.modules[0].lessons).toEqual([
      {
        title: "Starter Day 1",
        contentHtml: "<p>Flour + water.</p>",
        videoUrl: "https://www.youtube.com/watch?v=abc12345678",
        isPreview: false,
      },
      {
        title: "Shaping",
        contentHtml: null,
        videoUrl: "https://www.youtube.com/watch?v=def12345678",
        isPreview: false,
      },
    ]);
  });

  it("lesson videoUrl round-trips through the learn page's embed extractor", () => {
    // Copied condition from extractVideoEmbed in courses/[slug]/learn/page.tsx:
    // hostname includes youtube.com, id from ?v=. If that page changes shape,
    // this pins that our stored URLs still satisfy it.
    const url = new URL(playlistToCourse(fetched).modules[0].lessons[0].videoUrl!);
    expect(url.hostname.includes("youtube.com")).toBe(true);
    expect(url.searchParams.get("v")).toBe("abc12345678");
  });

  it("falls back to a generic title when the playlist has none", () => {
    expect(playlistToCourse({ ...fetched, playlistTitle: null }).title).toBe("Imported Course");
  });
});
