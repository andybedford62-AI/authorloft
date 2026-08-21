import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  detectMapping,
  mapLessonRow,
  groupRowsIntoCourses,
} from "@/lib/csv-import-courses";

/** Minimal CSV reader — the shipped template has no quoted/escaped cells. */
function parseCsv(csv: string): Record<string, string>[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

const TEMPLATE = "public/templates/authorloft-courses-import-template.csv";

describe("courses CSV import — Category column", () => {
  it("auto-detects the Category header from the shipped template", () => {
    const rows = parseCsv(readFileSync(TEMPLATE, "utf8"));
    const mapping = detectMapping(Object.keys(rows[0]));

    expect(mapping.categoryNames).toBe("Category");
    expect(mapping.courseTitle).toBe("Course Title");
    expect(mapping.lessonTitle).toBe("Lesson Title");
  });

  it("groups the template into the expected course tree with categories", () => {
    const rows = parseCsv(readFileSync(TEMPLATE, "utf8"));
    const mapping = detectMapping(Object.keys(rows[0]));
    const courses = groupRowsIntoCourses(rows.map((r) => mapLessonRow(r, mapping)));

    expect(courses).toHaveLength(2);

    const watercolor = courses[0];
    expect(watercolor.title).toBe("Intro to Watercolor");
    expect(watercolor.categoryNames).toEqual(["Watercolor & Painting"]);
    expect(watercolor.modules).toHaveLength(2);
    expect(watercolor.modules[0].lessons).toHaveLength(2);

    expect(courses[1].categoryNames).toEqual(["Freelancing"]);
  });

  it("splits multi-value category cells and de-dupes case-insensitively", () => {
    const rows = [
      { Course: "A", Lesson: "L1", Category: "Photography, Creative Arts" },
      { Course: "A", Lesson: "L2", Category: "photography; Productivity" },
    ];
    const mapping = detectMapping(Object.keys(rows[0]));
    const courses = groupRowsIntoCourses(rows.map((r) => mapLessonRow(r, mapping)));

    // First-seen spelling wins; the lowercase repeat is not added again.
    expect(courses[0].categoryNames).toEqual([
      "Photography",
      "Creative Arts",
      "Productivity",
    ]);
  });

  it("yields no categories when the column is absent", () => {
    const rows = [{ Course: "A", Lesson: "L1" }];
    const mapping = detectMapping(Object.keys(rows[0]));
    const courses = groupRowsIntoCourses(rows.map((r) => mapLessonRow(r, mapping)));

    expect(mapping.categoryNames).toBeUndefined();
    expect(courses[0].categoryNames).toEqual([]);
  });
});
