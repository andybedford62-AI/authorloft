import { NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { getAllSeoConfigs, SEO_PAGES } from "@/lib/seo-config";

// GET /api/super-admin/seo — returns all page SEO configs
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const configs = await getAllSeoConfigs();
  // Return as array with page metadata
  const pages = SEO_PAGES.map(p => ({
    ...p,
    ogImageUrl: configs[p.id] ?? null,
  }));
  return NextResponse.json(pages);
}
