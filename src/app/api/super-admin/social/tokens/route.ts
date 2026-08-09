import { NextRequest, NextResponse }  from "next/server";
import { prisma }                     from "@/lib/db";
import { requireSuperAdminId }        from "@/lib/super-admin-auth";
import { encryptToken, decryptToken } from "@/lib/social/encrypt";
import { testLinkedInToken }          from "@/lib/social/linkedin";
import { testFacebookToken }          from "@/lib/social/facebook";
import { testInstagramToken }         from "@/lib/social/instagram";
import { testTwitterTokens, TwitterCredentials } from "@/lib/social/twitter";

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

  const { platform, accessToken, accountId: rawAccountId } = await req.json();

  if (!platform || !accessToken?.trim()) {
    return NextResponse.json({ error: "platform and accessToken are required." }, { status: 400 });
  }

  // LinkedIn & Twitter auto-resolve accountId from the credentials; others require it
  const autoIdPlatforms = ["LINKEDIN", "TWITTER"];
  if (!autoIdPlatforms.includes(platform) && !rawAccountId?.trim()) {
    return NextResponse.json({ error: "accountId is required for this platform." }, { status: 400 });
  }

  const validPlatforms = ["LINKEDIN", "FACEBOOK", "INSTAGRAM", "TWITTER"];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: `platform must be one of: ${validPlatforms.join(", ")}` }, { status: 400 });
  }

  // Test the token before saving — LinkedIn auto-resolves accountId from the token
  let accountName: string;
  let accountId: string = rawAccountId?.trim() ?? "";
  try {
    switch (platform) {
      case "LINKEDIN": {
        const result = await testLinkedInToken(accessToken);
        accountName = result.name;
        accountId   = result.memberId;
        break;
      }
      case "FACEBOOK":
        accountName = await testFacebookToken(accessToken, accountId);
        break;
      case "INSTAGRAM":
        accountName = await testInstagramToken(accessToken, accountId);
        break;
      case "TWITTER": {
        // accessToken carries the 4 OAuth 1.0a credentials packed as JSON.
        const creds  = JSON.parse(accessToken) as TwitterCredentials;
        const result = await testTwitterTokens(creds);
        accountName  = result.name;
        accountId    = result.userId;
        break;
      }
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
