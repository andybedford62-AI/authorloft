import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sortOrder: number;
};

// GET /api/super-admin/settings/social-links
// Fetch all social links
export async function GET() {
  if (!(await requireSuperAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { socialLinks: true },
  });

  const links = (settings?.socialLinks as SocialLink[]) || [];
  return NextResponse.json({ socialLinks: links });
}

// PATCH /api/super-admin/settings/social-links
// Update all social links (replace entire array)
export async function PATCH(req: NextRequest) {
  if (!(await requireSuperAdminId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { socialLinks } = body;

  if (!Array.isArray(socialLinks)) {
    return NextResponse.json(
      { error: "socialLinks must be an array" },
      { status: 400 }
    );
  }

  // Validate each link
  for (const link of socialLinks) {
    if (!link.platform || !link.url || !link.icon) {
      return NextResponse.json(
        { error: "Each link must have platform, url, and icon" },
        { status: 400 }
      );
    }
    // Basic URL validation
    try {
      new URL(link.url);
    } catch {
      return NextResponse.json(
        { error: `Invalid URL: ${link.url}` },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        socialLinks: socialLinks,
      },
      update: {
        socialLinks: socialLinks,
      },
      select: { socialLinks: true },
    });

    return NextResponse.json({ socialLinks: updated.socialLinks });
  } catch (err) {
    console.error("Failed to save social links:", err);
    return NextResponse.json(
      { error: "Failed to save social links. Please try again." },
      { status: 500 }
    );
  }
}
