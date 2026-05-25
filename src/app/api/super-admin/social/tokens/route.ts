import { NextRequest, NextResponse }  from "next/server";
import { prisma }                     from "@/lib/db";
import { requireSuperAdminId }        from "@/lib/super-admin-auth";
import { encryptToken, decryptToken } from "@/lib/social/encrypt";
import { testLinkedInToken }          from "@/lib/social/linkedin";
import { testFacebookToken }          from "@/lib/social/facebook";
import { testInstagramToken }         from "@/lib/social/instagram";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await prisma.socialPlatformToken.findMany({
    orderBy: { platform: "asc" },
    select: { id: true, platform: true, accountId: true, accountName: true, tokenExpiresAt: true, isActive: true, updatedAt: true },
  });

  return NextResponse.json(tokens);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, accessToken, accountId } = await req.json();

  if (!platform || !accessToken?.trim() || !accountId?.trim()) {
    return NextResponse.json({ error: "platform, accessToken, and accountId are required." }, { status: 400 });
  }

  const validPlatforms = ["LINKEDIN", "FACEBOOK", "INSTAGRAM"];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: `platform must be one of: ${validPlatforms.join(", ")}` }, { status: 400 });
  }

  // Test the token before saving
  let accountName: string;
  try {
    switch (platform) {
      case "LINKEDIN":
        accountName = await testLinkedInToken(accessToken, accountId);
        break;
      case "FACEBOOK":
        accountName = await testFacebookToken(accessToken, accountId);
        break;
      case "INSTAGRAM":
        accountName = await testInstagramToken(accessToken, accountId);
        break;
      default:
        accountName = `Account ${accountId}`;
    }
  } catch (e: any) {
    return NextResponse.json({ error: `Token validation failed: ${e.message}` }, { status: 400 });
  }

  const encrypted = encryptToken(accessToken);

  const token = await prisma.socialPlatformToken.upsert({
    where:  { platform },
    create: { platform, accessToken: encrypted, accountId, accountName, isActive: true },
    update: { accessToken: encrypted, accountId, accountName, isActive: true, tokenExpiresAt: null },
  });

  return NextResponse.json({
    id: token.id, platform: token.platform, accountId: token.accountId,
    accountName: token.accountName, isActive: token.isActive,
  }, { status: 201 });
}
