import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ALL_THEMES, BASE_THEME_IDS, isThemeAllowed } from "@/lib/themes";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const VALID_THEMES = ALL_THEMES.map((t) => t.id);

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { siteTheme } = body;

  if (siteTheme !== undefined) {
    // Validate theme ID
    if (!VALID_THEMES.includes(siteTheme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Fetch current plan + baseTheme to validate access and track base theme
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { plan: { select: { tier: true } }, baseTheme: true, siteTheme: true },
    });

    const planTier = author?.plan?.tier ?? "FREE";

    // Enforce plan access
    if (!isThemeAllowed(siteTheme, planTier)) {
      return NextResponse.json(
        { error: "This theme is not available on your current plan." },
        { status: 403 }
      );
    }

    // When selecting a genre palette, save the current base theme so we can
    // revert cleanly on downgrade. Only update baseTheme when switching TO a
    // genre palette FROM a base theme (not on every save).
    const isGenrePalette   = !BASE_THEME_IDS.includes(siteTheme as any);
    const currentIsBase    = BASE_THEME_IDS.includes((author?.siteTheme ?? "classic-literary") as any);
    const shouldSaveBase   = isGenrePalette && currentIsBase;

    await prisma.author.update({
      where: { id: authorId },
      data: {
        siteTheme,
        ...(shouldSaveBase && { baseTheme: author!.siteTheme }),
      },
    });

    return NextResponse.json({ ok: true, siteTheme });
  }

  // homeTemplate (layout) — still supported, no plan gating
  const { homeTemplate } = body;
  if (homeTemplate !== undefined) {
    const VALID_TEMPLATES = ["classic", "minimal", "bold"];
    if (!VALID_TEMPLATES.includes(homeTemplate)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }
    await prisma.author.update({ where: { id: authorId }, data: { homeTemplate } });
    return NextResponse.json({ ok: true, homeTemplate });
  }

  // booksLayout — list is free; grid/shelf require Standard or Premium
  const { booksLayout } = body;
  if (booksLayout !== undefined) {
    const VALID_LAYOUTS = ["list", "grid", "shelf"];
    if (!VALID_LAYOUTS.includes(booksLayout)) {
      return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
    }
    if (booksLayout !== "list") {
      const author = await prisma.author.findUnique({
        where: { id: authorId },
        select: { plan: { select: { tier: true } } },
      });
      const tier = author?.plan?.tier ?? "FREE";
      if (tier === "FREE") {
        return NextResponse.json(
          { error: "Grid and Shelf layouts require a Standard or Premium plan." },
          { status: 403 }
        );
      }
    }
    await prisma.author.update({ where: { id: authorId }, data: { booksLayout } });
    return NextResponse.json({ ok: true, booksLayout });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
