import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { syncSubscriberToProvider, type EmailProvider } from "@/lib/email-integrations";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(key) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}

const schema = z.object({
  authorId: z.string(),
  name: z.string().max(200).optional(),
  email: z.string().email().max(200),
  categoryPrefs: z.array(z.string().max(100)).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${data.email}`)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const [subscriber, author] = await Promise.all([
      prisma.subscriber.upsert({
        where: { authorId_email: { authorId: data.authorId, email: data.email } },
        update: { name: data.name, categoryPrefs: data.categoryPrefs || [] },
        create: {
          authorId: data.authorId,
          name: data.name,
          email: data.email,
          categoryPrefs: data.categoryPrefs || [],
          isConfirmed: true,
        },
      }),
      prisma.author.findUnique({
        where: { id: data.authorId },
        select: { emailProvider: true, emailProviderKey: true, emailProviderExtra: true },
      }),
    ]);

    // Fire-and-forget sync to external email provider if configured
    if (author?.emailProvider && author.emailProviderKey) {
      syncSubscriberToProvider(
        author.emailProvider as EmailProvider,
        author.emailProviderKey,
        author.emailProviderExtra ?? null,
        data.email,
        data.name
      ).catch((err) => {
        console.error("[newsletter/subscribe] External sync failed:", err);
      });
    }

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
