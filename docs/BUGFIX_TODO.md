# AuthorLoft — Bug Fix Todo

**Status:** ✅ ALL RESOLVED (June 6, 2026)
Verified with `npx tsc --noEmit` (0 errors) and `npx next build` (exit 0).

---

## Bug 1 — Blog Post Attachment Fields ✅ RESOLVED
**Was:** `attachmentUrl` / `attachmentLabel` thought to be missing from `Post` model.
**Reality:** Already present in `prisma/schema.prisma` (Post model, fields under "Downloadable resource") and used correctly in:
- `src/app/(admin)/admin/blog/[id]/edit/page.tsx`
- `src/app/(author-site)/[domain]/blog/[slug]/page.tsx`

No action required — fixed in a prior session.

---

## Bug 2 — Marketing Blog SEO Fields ✅ RESOLVED
**Was:** `seoTitle` / `metaDescription` thought to be missing from `PlatformPost` model.
**Reality:** Already present in `prisma/schema.prisma` (PlatformPost model, "SEO fields") and used correctly in:
- `src/app/(marketing)/blog/[slug]/page.tsx` — `generateMetadata` reads both

No action required — fixed in a prior session.

---

## Bug 3 — Stale Next.js Type Cache (ARC routes) ✅ RESOLVED
**Was:** `.next/types/validator.ts` referenced 11 ARC route files that no longer exist (old structure: `arc/apply/[bookId]`, `api/arc/apply`, etc. — actual structure is now `arc/[token]`, `api/arc/[token]`).
**Fix applied (June 6, 2026):** Deleted `.next/` folder + `npx prisma generate` + clean `npx next build`. The validator regenerated against the real route tree.

**If these phantom errors ever reappear locally:** just delete `.next/` and rebuild. Vercel never sees them (always builds clean).

---

## Result

- `npx tsc --noEmit` → **0 errors**
- `npx next build` → **succeeds (exit 0)**

No source code changes were needed — Bugs 1 & 2 were already fixed, Bug 3 was a local cache artifact only.
