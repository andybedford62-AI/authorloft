// ISBN (print editions) and ASIN (Amazon's own ID, usually the Kindle edition)
// are separate fields on a book. Values often arrive copy-pasted from KDP or
// Amazon with a label and invisible text-direction marks attached
// ("‎ 979-…", "/ ASIN: B0H…"), so both are cleaned on save.

const INVISIBLE = /[​-‏‪-‮⁠﻿]/g;

/** Strips invisible marks, whitespace and a leading "ISBN"/"ASIN" label; "" → null. */
export function cleanIdentifier(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input
    .replace(INVISIBLE, "")
    .trim()
    .replace(/^[\s/:,#-]*(?:ISBN(?:-1[03])?|ASIN)?[\s/:,#-]*/i, "")
    .trim();
  return v || null;
}
