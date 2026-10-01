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

  const { platform, accessToken, accountId: rawAccountId, tokenExpiresAt: rawExpiry } = await req.json();

  if (!platform || !accessToken?.trim()) {
    return NextResponse.json({ error: "platform and accessToken are required." }, { status: 400 });
  }

  // Optional expiry (YYYY-MM-DD), entered from the date the platform shows when the token is issued.
  // The platform APIs we call don't report it, so it is recorded by hand and only used for display.
  let tokenExpiresAt: Date | null = null;
  if (rawExpiry) {
    const parsed = new Date(`${String(rawExpiry)}T23:59:59Z`);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Token expiry must be a valid date." }, { status: 400 });
    }
    if (parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Token expiry date is in the past. Check the date shown when the token was generated." }, { status: 400 });
    }
    tokenExpiresAt = parsed;
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
    create: { platform, accessToken: encrypted, accountId, accountName, isActive: true, tokenExpiresAt },
    update: { accessToken: encrypted, accountId, accountName, isActive: true, tokenExpiresAt },
  });

  return NextResponse.json({
    id: token.id, platform: token.platform, accountId: token.accountId,
    accountName: token.accountName, isActive: token.isActive, tokenExpiresAt: token.tokenExpiresAt,
  }, { status: 201 });
}
