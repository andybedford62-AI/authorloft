// A plan gate reads a Plan column; if the query feeding it didn't select that
// column the value is undefined, the gate silently evaluates false, and the
// feature just never appears. TypeScript can't catch it — these call sites cast
// the plan through `as any`. That is exactly how the Music toggle went missing
// from /admin/pages after shipping: the gate and the prop were both correct,
// the select wasn't.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Files whose Plan select feeds a nav/plan gate.
const FILES = [
  "src/app/(admin)/admin/pages/page.tsx",
  "src/app/(admin)/admin/dashboard/page.tsx",
  "src/app/(author-site)/[domain]/layout.tsx",
];

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("Plan selects keep parallel feature gates in step", () => {
  it.each(FILES)("%s selects musicEnabled wherever it selects coursesEnabled", (rel) => {
    const src = read(rel);
    if (!src.includes("coursesEnabled: true")) return; // not a gating select
    expect(
      src.includes("musicEnabled: true"),
      `${rel} selects coursesEnabled but not musicEnabled — the Music gate will read undefined and hide the feature`,
    ).toBe(true);
  });

  it("the nav registry gates Music on the plan flag, not just the toggle", () => {
    // Both halves matter: plan flag AND the author's own show/hide choice.
    const src = read("src/lib/site-pages.ts");
    expect(src).toMatch(/musicEnabled\s*&&\s*author\.navShowMusic/);
  });
});
