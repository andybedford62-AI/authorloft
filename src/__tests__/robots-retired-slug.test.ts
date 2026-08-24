// Server route, no DOM: the default jsdom environment costs ~30s to spin up
// here, which starves the shared transform pipeline and pushes the
// timing-sensitive rate-limit test past its timeout in the full run.
// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

// The route reads the Host header to decide which robots body to serve.
let currentHost = "";
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: currentHost }),
}));

const findFirst = vi.fn();
const findUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    author: { findFirst: (...a: unknown[]) => findFirst(...a) },
    authorSlugHistory: { findUnique: (...a: unknown[]) => findUnique(...a) },
  },
}));

import { GET } from "@/app/api/internal/robots/route";

async function robotsFor(host: string): Promise<string> {
  currentHost = host;
  const res = await GET();
  return res.text();
}

describe("/robots.txt — author subdomains", () => {
  beforeEach(() => {
    findFirst.mockReset();
    findUnique.mockReset();
    findFirst.mockResolvedValue(null);
    findUnique.mockResolvedValue(null);
  });

  it("allows a live author subdomain and points at its sitemap", async () => {
    findFirst.mockResolvedValue({ id: "author_1" });

    const body = await robotsFor("apbedford.authorloft.com");

    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap: https://apbedford.authorloft.com/sitemap.xml");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("allows a retired slug so Googlebot can follow its 308s", async () => {
    // The bug this guards: a retired slug has no live Author row, so it used to
    // fall through to Disallow-everything. That blocked Googlebot from ever
    // fetching the 308s that redirectIfRetiredSlug serves, stranding the ranking
    // transfer the redirect exists to perform. Search Console reported the whole
    // host as blocked (8 URLs on apbedford2.authorloft.com, Aug 2026).
    findUnique.mockResolvedValue({ author: { isActive: true } });

    const body = await robotsFor("apbedford2.authorloft.com");

    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow: /\n");
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "apbedford2" } }),
    );
  });

  it("omits the Sitemap line for a retired slug", async () => {
    // That host has no sitemap of its own — the path 404s. Advertising it would
    // hand Google a dead sitemap; the live subdomain advertises the real one.
    findUnique.mockResolvedValue({ author: { isActive: true } });

    expect(await robotsFor("apbedford2.authorloft.com")).not.toContain("Sitemap:");
  });

  it("blocks a retired slug whose author is deactivated", async () => {
    findUnique.mockResolvedValue({ author: { isActive: false } });

    const body = await robotsFor("apbedford2.authorloft.com");

    expect(body).toContain("Disallow: /");
    expect(body).not.toContain("Allow: /");
  });

  it("blocks an unknown subdomain", async () => {
    const body = await robotsFor("nobody.authorloft.com");

    expect(body).toContain("Disallow: /");
    expect(body).not.toContain("Allow: /");
  });

  it("serves the platform rules on www without touching the author tables", async () => {
    const body = await robotsFor("www.authorloft.com");

    expect(body).toContain("Disallow: /super-admin");
    expect(body).toContain("Sitemap: https://www.authorloft.com/sitemap.xml");
    expect(findFirst).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });
});
