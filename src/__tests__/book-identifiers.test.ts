import { describe, it, expect } from "vitest";
import { cleanIdentifier } from "@/lib/book-identifiers";

describe("cleanIdentifier", () => {
  it("strips pasted labels, spaces and invisible direction marks", () => {
    expect(cleanIdentifier("/ ASIN: B0HFDH89VT")).toBe("B0HFDH89VT");
    expect(cleanIdentifier("‎ 979-8193809333")).toBe("979-8193809333");
    expect(cleanIdentifier(" 978-0-9866209-3-5")).toBe("978-0-9866209-3-5");
    expect(cleanIdentifier("ISBN-13: 9798251803211")).toBe("9798251803211");
  });

  it("leaves a plain value alone and turns empty into null", () => {
    expect(cleanIdentifier("B0H273ZPB4")).toBe("B0H273ZPB4");
    expect(cleanIdentifier("   ")).toBeNull();
    expect(cleanIdentifier(undefined)).toBeNull();
  });
});
