import { describe, it, expect } from "vitest";
import { assemblePrompt } from "@/lib/social-promote/prompt-assembly";

const base = {
  platform:  { name: "LinkedIn", maxChars: 3000, hashtagStyle: "trailing", promptAddendum: null },
  promoType: { name: "New Course Launch", promptTemplate: 'Announce "{{course.title}}" ({{course.price}}). Link: {{course.url}}' },
  author:    { displayName: "Jo Rivers", voice: null },
};

const course = {
  title: "Plotting Your Mystery",
  description: "A six-week course on clue placement.",
  price: "$49.00",
  moduleTitles: ["Clues", "Red herrings"],
  lessonCount: 9,
  previewLessonCount: 2,
  url: "https://jo.authorloft.com/courses/plotting?utm_source=linkedin",
};

describe("assemblePrompt — course context", () => {
  const prompt = assemblePrompt({ ...base, context: { type: "course", course } });

  it("substitutes course tokens into the template", () => {
    expect(prompt).toContain('Announce "Plotting Your Mystery" ($49.00). Link: https://jo.authorloft.com/courses/plotting?utm_source=linkedin');
  });

  it("puts course facts and link inside author_data", () => {
    const data = prompt.slice(prompt.indexOf("<author_data>"), prompt.indexOf("</author_data>"));
    expect(data).toContain("Course title: Plotting Your Mystery");
    expect(data).toContain("Price: $49.00");
    expect(data).toContain("Size: 2 modules, 9 lessons");
    expect(data).toContain("Modules: 1. Clues; 2. Red herrings");
    expect(data).toContain("Free preview lessons: 2");
    expect(data).toContain("Link to the course: https://jo.authorloft.com/courses/plotting");
  });

  it("leaves book tokens empty for a course (why course promo types don't reuse book templates)", () => {
    const p = assemblePrompt({ ...base, promoType: { name: "x", promptTemplate: "[{{book.title}}]" }, context: { type: "course", course } });
    expect(p).toContain("[]");
  });
});
