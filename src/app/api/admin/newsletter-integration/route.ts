import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  testKitConnection,
  testMailchimpConnection,
  testActiveCampaignConnection,
  type EmailProvider,
} from "@/lib/email-integrations";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { emailProvider: true, emailProviderKey: true, emailProviderExtra: true },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    provider: author.emailProvider ?? null,
    // Mask the key — only return whether it's set, not the actual value
    hasKey: !!author.emailProviderKey,
    extra:  author.emailProviderExtra ?? null,
  });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { provider, apiKey, extra } = body as {
    provider: string | null;
    apiKey:   string | null;
    extra:    string | null;
  };

  // Clearing the integration
  if (!provider) {
    await prisma.author.update({
      where: { id: authorId },
      data: { emailProvider: null, emailProviderKey: null, emailProviderExtra: null },
    });
    return NextResponse.json({ ok: true });
  }

  const validProviders: EmailProvider[] = ["KIT", "MAILCHIMP", "ACTIVECAMPAIGN"];
  if (!validProviders.includes(provider as EmailProvider)) {
    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  }

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required." }, { status: 400 });
  }

  // Fetch existing key to allow saving without re-entering the masked key
  const existing = await prisma.author.findUnique({
    where: { id: authorId },
    select: { emailProviderKey: true },
  });

  const keyToSave = apiKey === "••••••••" ? existing?.emailProviderKey ?? apiKey : apiKey;

  await prisma.author.update({
    where: { id: authorId },
    data: {
      emailProvider:     provider,
      emailProviderKey:  keyToSave,
      emailProviderExtra: extra?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, apiKey, extra } = await req.json() as {
    provider: string;
    apiKey:   string;
    extra:    string | null;
  };

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required to test." }, { status: 400 });
  }

  // If the masked placeholder is sent, fetch the real key from DB
  let keyToTest = apiKey;
  if (apiKey === "••••••••") {
    const existing = await prisma.author.findUnique({
      where: { id: authorId },
      select: { emailProviderKey: true },
    });
    if (!existing?.emailProviderKey) {
      return NextResponse.json({ error: "No API key saved to test." }, { status: 400 });
    }
    keyToTest = existing.emailProviderKey;
  }

  let result: { ok: boolean; error?: string };

  switch (provider as EmailProvider) {
    case "KIT":
      result = await testKitConnection(keyToTest);
      break;
    case "MAILCHIMP":
      if (!extra?.trim()) {
        return NextResponse.json({ error: "Audience ID is required." }, { status: 400 });
      }
      result = await testMailchimpConnection(keyToTest, extra);
      break;
    case "ACTIVECAMPAIGN":
      if (!extra?.trim()) {
        return NextResponse.json({ error: "Account URL is required." }, { status: 400 });
      }
      result = await testActiveCampaignConnection(keyToTest, extra);
      break;
    default:
      return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  }

  return NextResponse.json(result);
}
