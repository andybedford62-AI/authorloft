import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

function extractContentValue(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/content\s*=\s*["']([^"']+)["']/i);
  return match ? match[1] : trimmed;
}

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { googleSiteVerification: true, bingSiteVerification: true },
  });

  return NextResponse.json({
    googleSiteVerification: author?.googleSiteVerification ?? "",
    bingSiteVerification: author?.bingSiteVerification ?? "",
  });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { googleSiteVerification, bingSiteVerification } = await req.json();

  const googleVal = typeof googleSiteVerification === "string" ? extractContentValue(googleSiteVerification) : undefined;
  const bingVal = typeof bingSiteVerification === "string" ? extractContentValue(bingSiteVerification) : undefined;

  await prisma.author.update({
    where: { id: authorId },
    data: {
      ...(googleVal !== undefined && { googleSiteVerification: googleVal || null }),
      ...(bingVal !== undefined && { bingSiteVerification: bingVal || null }),
    },
  });

  return NextResponse.json({ ok: true });
}
