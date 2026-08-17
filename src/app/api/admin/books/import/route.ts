import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { slugify } from "@/lib/utils";
import { MAX_IMPORT_ROWS, type MappedBookRow } from "@/lib/csv-import";

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base || "item";
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rows: MappedBookRow[] = Array.isArray(body?.rows) ? body.rows : [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows to import." }, { status: 400 });
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return NextResponse.json({ error: `Too many rows (max ${MAX_IMPORT_ROWS}).` }, { status: 400 });
  }

  const warnings: string[] = [];

  const validRows = rows.filter((r) => typeof r?.title === "string" && r.title.trim() !== "");
  if (validRows.length < rows.length) {
    const skipped = rows.length - validRows.length;
    warnings.push(`${skipped} row${skipped === 1 ? "" : "s"} without a title were skipped.`);
  }

  // Plan limit: import up to the remaining slots
  const limits = await getAuthorPlanLimits(authorId);
  const currentCount = await prisma.book.count({ where: { authorId } });
  const remaining = limits.maxBooks === null ? validRows.length : Math.max(0, limits.maxBooks - currentCount);

  const toImport = validRows.slice(0, remaining);
  const skippedForPlanLimit = validRows.length - toImport.length;

  if (toImport.length === 0) {
    return NextResponse.json({ imported: 0, skippedForPlanLimit, warnings });
  }

  // Pre-fetch existing genres/series/book slugs for case-insensitive matching + slug uniqueness.
  // Genres are one shared, platform-wide list (see docs/CHANGELOG.md Aug 17 2026), so matching
  // is unscoped — a CSV row's "Cozy Mystery" should match the shared genre even if a different
  // author added it. An unmatched name still auto-creates (tagged with this author's id only
  // because the schema requires an owner), joining the shared list for everyone from then on.
  const [existingGenres, existingSeries, existingBooks] = await Promise.all([
    prisma.genre.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.series.findMany({ where: { authorId }, select: { id: true, name: true, slug: true } }),
    prisma.book.findMany({ where: { authorId }, select: { slug: true } }),
  ]);

  const genreByName  = new Map(existingGenres.map((g) => [g.name.toLowerCase(), g]));
  const seriesByName = new Map(existingSeries.map((s) => [s.name.toLowerCase(), s]));
  const usedGenreSlugs  = new Set(existingGenres.map((g) => g.slug));
  const usedSeriesSlugs = new Set(existingSeries.map((s) => s.slug));
  const usedBookSlugs   = new Set(existingBooks.map((b) => b.slug));

  let imported = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of toImport) {
      // Resolve genres (case-insensitive match, auto-create otherwise)
      const genreIds: string[] = [];
      for (const rawName of row.genreNames ?? []) {
        const name = rawName.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        let genre = genreByName.get(key);
        if (!genre) {
          const slug = uniqueSlug(slugify(name) || "genre", usedGenreSlugs);
          genre = await tx.genre.create({
            data: { authorId, name, slug, parentId: null },
            select: { id: true, name: true, slug: true },
          });
          genreByName.set(key, genre);
        }
        genreIds.push(genre.id);
      }

      // Resolve series (case-insensitive match, auto-create otherwise)
      let seriesId: string | null = null;
      const seriesName = row.seriesName?.trim();
      if (seriesName) {
        const key = seriesName.toLowerCase();
        let series = seriesByName.get(key);
        if (!series) {
          const slug = uniqueSlug(slugify(seriesName) || "series", usedSeriesSlugs);
          series = await tx.series.create({
            data: { authorId, name: seriesName, slug },
            select: { id: true, name: true, slug: true },
          });
          seriesByName.set(key, series);
        }
        seriesId = series.id;
      }

      const slug = uniqueSlug(slugify(row.title) || "book", usedBookSlugs);

      await tx.book.create({
        data: {
          authorId,
          title: row.title.trim(),
          slug,
          subtitle:         row.subtitle || null,
          description:      row.description || null,
          coverImageUrl:    row.coverImageUrl || null,
          isbn:             row.isbn || null,
          pageCount:        row.pageCount ?? null,
          priceCents:       row.priceCents || 0,
          availableFormats: Array.isArray(row.availableFormats) ? row.availableFormats : [],
          releaseDate:      row.releaseDate ? new Date(row.releaseDate) : null,
          isPublished:      false, // imported as draft for review
          seriesId,
          genres: genreIds.length > 0 ? { create: genreIds.map((genreId) => ({ genreId })) } : undefined,
        },
      });

      imported++;
    }
  });

  return NextResponse.json({ imported, skippedForPlanLimit, warnings });
}
