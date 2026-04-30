import { describe, it, expect } from "vitest";
import { esc } from "@/lib/mailer";

describe("esc()", () => {
  it("escapes < and > to prevent HTML injection", () => {
    expect(esc("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes & before other replacements to avoid double-encoding", () => {
    expect(esc("Tom & Jerry")).toBe("Tom &amp; Jerry");
    expect(esc("&lt;")).toBe("&amp;lt;");
  });

  it("escapes double quotes for attribute contexts", () => {
    expect(esc('href="evil"')).toBe("href=&quot;evil&quot;");
  });

  it("leaves safe characters unchanged", () => {
    expect(esc("Hello, World! 123")).toBe("Hello, World! 123");
  });

  it("handles empty string", () => {
    expect(esc("")).toBe("");
  });

  it("neutralises a realistic XSS payload", () => {
    const payload = '<img src=x onerror="fetch(\'https://evil.com\')">';
    const escaped = esc(payload);
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
    expect(escaped).toContain("&lt;img");
  });
});
