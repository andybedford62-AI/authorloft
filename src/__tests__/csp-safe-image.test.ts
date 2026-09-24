// Admin image previews and CSP img-src. A raw <img> pointing at a host the CSP
// doesn't list (Amazon, Google Books ISBN covers, a logo on another domain) is
// blocked outright — this bit the music track thumbnails and every pasted/
// imported book cover preview. cspSafeImageSrc routes those through
// /_next/image; the guard below keeps new admin <img> tags from skipping it.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { cspSafeImageSrc } from "@/lib/csp-safe-image";

describe("cspSafeImageSrc", () => {
  it("proxies hosts the CSP doesn't allow", () => {
    expect(cspSafeImageSrc("https://m.media-amazon.com/images/I/x.jpg")).toBe(
      "/_next/image?url=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2Fx.jpg&w=640&q=75"
    );
    expect(cspSafeImageSrc("https://books.google.com/books/content?id=1", 128)).toContain("&w=128&");
  });

  it("leaves Supabase uploads, local previews and site paths alone", () => {
    const supa = "https://abc.supabase.co/storage/v1/object/public/book-covers/a.webp";
    expect(cspSafeImageSrc(supa)).toBe(supa);
    expect(cspSafeImageSrc("blob:https://www.authorloft.com/123")).toBe("blob:https://www.authorloft.com/123");
    expect(cspSafeImageSrc("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(cspSafeImageSrc("/authorloft-logo.png")).toBe("/authorloft-logo.png");
  });

  it("does not treat protocol-relative URLs as same-site", () => {
    expect(cspSafeImageSrc("//evil.example/x.png")).toBe("//evil.example/x.png"); // not http(s): untouched, CSP still blocks it
  });

  it("handles empty values", () => {
    expect(cspSafeImageSrc("")).toBeUndefined();
    expect(cspSafeImageSrc(null)).toBeUndefined();
  });
});

describe("admin <img> tags go through cspSafeImageSrc", () => {
  const ROOTS = [
    "src/components/admin",
    "src/components/super-admin",
    "src/app/(admin)",
    "src/app/(super-admin)",
  ];
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
    });

  const offenders: string[] = [];
  for (const root of ROOTS) {
    for (const file of walk(join(process.cwd(), root))) {
      const src = readFileSync(file, "utf8");
      // Every <img ... src={...}> — a string-literal src (src="/logo.png") is fine.
      for (const m of src.matchAll(/<img\b[^>]*?\bsrc=\{\s*([^}]*)/g)) {
        if (!m[1].startsWith("cspSafeImageSrc(")) {
          offenders.push(`${file.replace(process.cwd(), "")}: src={${m[1].trim()}}`);
        }
      }
    }
  }

  it("has no raw dynamic <img src> in admin code", () => {
    expect(offenders, `wrap these with cspSafeImageSrc(), or use next/image:\n${offenders.join("\n")}`).toEqual([]);
  });
});
