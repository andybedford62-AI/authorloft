import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.enum(["news", "footer", "home"]).optional(),
});

// POST /api/news/subscribe — public AuthorLoft News signup.
// Phase 1: capture only (no confirmation email sent yet). Idempotent by email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${data.email}`)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const email = data.email.trim().toLowerCase();

    const subscriber = await prisma.platformSubscriber.upsert({
      where: { email },
      update: { name: data.name, source: data.source ?? undefined },
      create: { email, name: data.name, source: data.source ?? "news" },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    console.error("[news/subscribe] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
