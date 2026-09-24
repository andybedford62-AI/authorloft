import { describe, it, expect, vi, afterEach } from "vitest";
import { checkCoverUrl, findBadCoverUrls } from "@/lib/cover-url-check";

function respond(status: number, headers: Record<string, string> = {}) {
  return new Response(null, { status, headers });
}

afterEach(() => vi.unstubAllGlobals());

describe("checkCoverUrl", () => {
  it("allows an empty cover", async () => {
    expect(await checkCoverUrl("")).toEqual({ ok: true });
    expect(await checkCoverUrl(null)).toEqual({ ok: true });
  });

  it("rejects a product page (HTML)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(200, { "content-type": "text/html; charset=utf-8" })));
    const r = await checkCoverUrl("https://www.amazon.com/dp/B0TEST");
    expect(r.ok).toBe(false);
  });

  it("accepts an image", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(200, { "content-type": "image/jpeg" })));
    expect(await checkCoverUrl("https://m.media-amazon.com/images/I/x.jpg")).toEqual({ ok: true });
  });

  it("rejects not found", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(404)));
    expect((await checkCoverUrl("https://example.com/gone.jpg")).ok).toBe(false);
  });

  it("allows inconclusive answers (403, network error)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(403)));
    expect(await checkCoverUrl("https://example.com/a.jpg")).toEqual({ ok: true });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNRESET"); }));
    expect(await checkCoverUrl("https://example.com/a.jpg")).toEqual({ ok: true });
  });

  it("follows redirects and checks the final answer", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respond(301, { location: "https://cdn.example.com/c.png" }))
      .mockResolvedValueOnce(respond(200, { "content-type": "image/png" }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await checkCoverUrl("https://example.com/c")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refuses private hosts, including via a redirect, without fetching them", async () => {
    const fetchMock = vi.fn(async () => respond(302, { location: "http://169.254.169.254/latest" }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await checkCoverUrl("http://localhost/x.png")).ok).toBe(false);
    expect((await checkCoverUrl("https://example.com/r")).ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects non-web addresses", async () => {
    expect((await checkCoverUrl("ftp://example.com/a.jpg")).ok).toBe(false);
    expect((await checkCoverUrl("not a url")).ok).toBe(false);
  });
});

describe("findBadCoverUrls", () => {
  it("returns only the definite failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: URL) =>
      String(u).includes("page") ? respond(200, { "content-type": "text/html" }) : respond(200, { "content-type": "image/jpeg" })
    ));
    const bad = await findBadCoverUrls(["https://a.com/page", "https://a.com/img.jpg"]);
    expect([...bad]).toEqual(["https://a.com/page"]);
  });
});
