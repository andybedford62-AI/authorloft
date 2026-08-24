// Guards the CSP against the class of bug found Aug 24 2026: the course lesson
// viewer builds a YouTube/Vimeo <iframe>, but frame-src only allowed Stripe, so
// the browser blocked every video lesson and rendered an empty grey box. The
// embed hosts and the CSP live in different files, so nothing but a test keeps
// them agreeing.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
const learnPage = readFileSync(
  join(process.cwd(), "src", "app", "(author-site)", "[domain]", "courses", "[slug]", "learn", "page.tsx"),
  "utf8",
);

function frameSrc(): string {
  const line = config.split("\n").find((l) => l.includes("frame-src"));
  if (!line) throw new Error("no frame-src directive found in next.config.ts");
  return line;
}

describe("CSP frame-src vs. the embed URLs we actually build", () => {
  it("still has a frame-src directive", () => {
    expect(frameSrc()).toBeTruthy();
  });

  // Each host extractVideoEmbed() can emit must be allowed to frame.
  it.each([
    ["https://www.youtube-nocookie.com", "YouTube lesson videos"],
    ["https://player.vimeo.com", "Vimeo lesson videos"],
  ])("allows %s (%s)", (host) => {
    expect(frameSrc()).toContain(host);
  });

  it("still allows Stripe's payment frames", () => {
    const fs = frameSrc();
    expect(fs).toContain("https://js.stripe.com");
    expect(fs).toContain("https://hooks.stripe.com");
    expect(fs).toContain("https://checkout.stripe.com");
  });

  it("never opens frame-src to everything", () => {
    // A wildcard would make this test vacuous and undo the point of the CSP.
    expect(frameSrc()).not.toMatch(/frame-src[^"]*\*/);
  });

  it("the learn page still emits the hosts this test pins", () => {
    // If extractVideoEmbed is retargeted at a different host, the assertions
    // above would keep passing while the real embed broke again. Pin the link.
    expect(learnPage).toContain("youtube-nocookie.com/embed/");
    expect(learnPage).toContain("player.vimeo.com/video/");
  });
});
