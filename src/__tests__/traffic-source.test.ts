import { describe, it, expect } from "vitest";
import { trafficSourceLabel, labelTrafficSources } from "@/lib/traffic-source";

describe("trafficSourceLabel", () => {
  it("names the networks the share kit tags", () => {
    expect(trafficSourceLabel("instagram")).toBe("Instagram");
    expect(trafficSourceLabel("tiktok")).toBe("TikTok");
    expect(trafficSourceLabel("qr")).toBe("QR code");
  });

  it("passes referring domains and Direct through", () => {
    expect(trafficSourceLabel("www.google.com")).toBe("www.google.com");
    expect(trafficSourceLabel("Direct")).toBe("Direct");
  });

  it("title-cases an unknown tag", () => {
    expect(trafficSourceLabel("book_club")).toBe("Book Club");
  });
});

describe("labelTrafficSources", () => {
  it("merges share-sheet and copy-link into one row and re-sorts", () => {
    expect(
      labelTrafficSources([
        { source: "Direct", views: 10 },
        { source: "share-sheet", views: 6 },
        { source: "copy-link", views: 7 },
        { source: "instagram", views: 3 },
      ])
    ).toEqual([
      { source: "Shared link", views: 13 },
      { source: "Direct", views: 10 },
      { source: "Instagram", views: 3 },
    ]);
  });

  it("caps the list", () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({ source: `site${i}.com`, views: 15 - i }));
    expect(labelTrafficSources(rows)).toHaveLength(10);
  });
});
