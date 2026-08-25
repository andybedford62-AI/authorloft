// The limits the page advertises and the limits the server enforces come from
// one table; these pin that the table matches the Supabase bucket's own rules.
// A mismatch fails at the storage layer with an error the author can't act on.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import {
  PREVIEW_MEDIA_LIMITS, PREVIEW_MEDIA_EXTENSIONS, MAX_PREVIEW_BYTES,
  limitForMime, formatMb, tooLargeMessage, unsupportedTypeMessage,
  PREVIEW_LIMIT_SUMMARY,
} from "@/lib/preview-media-limits";

// Read from the live bucket on 2026-08-25:
//   file_size_limit    52428800 (50 MB)
//   allowed_mime_types image/jpeg,image/png,image/webp,image/gif,
//                      video/mp4,audio/mpeg,audio/mp3,video/quicktime
const BUCKET_LIMIT_BYTES = 52428800;
const BUCKET_MIMES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "audio/mpeg", "audio/mp3", "video/quicktime",
];

describe("app limits vs. the book-previews bucket", () => {
  it("never allows a file larger than the bucket will accept", () => {
    // Supabase rejects past this regardless of what we permit.
    expect(MAX_PREVIEW_BYTES).toBeLessThanOrEqual(BUCKET_LIMIT_BYTES);
  });

  it("only accepts mime types the bucket allows", () => {
    for (const mime of Object.keys(PREVIEW_MEDIA_LIMITS)) {
      expect(BUCKET_MIMES, `${mime} is accepted by the app but not by the bucket`).toContain(mime);
    }
  });

  it("has an extension for every accepted mime type", () => {
    // The signed-URL route validates by extension, the client by mime — both
    // must recognise the same files or one will reject what the other allows.
    const exts = new Set<string>(PREVIEW_MEDIA_EXTENSIONS);
    for (const mime of Object.keys(PREVIEW_MEDIA_LIMITS)) {
      const sub = mime.split("/")[1];
      const expected =
        sub === "jpeg" ? ["jpg", "jpeg"] :
        sub === "quicktime" ? ["mov"] :
        sub === "mpeg" ? ["mp3"] : [sub];
      expect(expected.some((e) => exts.has(e)), `no extension covers ${mime}`).toBe(true);
    }
  });
});

describe("limit lookups and messages", () => {
  it("returns the right cap per type and null for anything else", () => {
    expect(limitForMime("video/mp4")).toBe(50 * 1024 * 1024);
    expect(limitForMime("image/png")).toBe(5 * 1024 * 1024);
    expect(limitForMime("audio/mpeg")).toBe(20 * 1024 * 1024);
    expect(limitForMime("application/pdf")).toBeNull();
  });

  it("tells the author the actual size and the actual limit", () => {
    const file = { name: "trailer.mp4", size: 82 * 1024 * 1024 } as File;
    const msg = tooLargeMessage(file, limitForMime("video/mp4")!);
    expect(msg).toContain("trailer.mp4");
    expect(msg).toContain("82 MB");
    expect(msg).toContain("50 MB");
  });

  it("names the file type it refused", () => {
    const msg = unsupportedTypeMessage({ name: "notes.pdf", size: 10 } as File);
    expect(msg).toContain("PDF");
  });

  it("summarises every limit in the text shown on the page", () => {
    expect(PREVIEW_LIMIT_SUMMARY).toContain("5 MB");
    expect(PREVIEW_LIMIT_SUMMARY).toContain("50 MB");
    expect(PREVIEW_LIMIT_SUMMARY).toContain("20 MB");
  });

  it("formats whole megabytes", () => {
    expect(formatMb(52428800)).toBe("50 MB");
  });
});
