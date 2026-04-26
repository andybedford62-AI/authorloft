import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { encrypt } from "@/lib/encrypt";

/** GET — returns whether a key is saved (never returns the key itself) */
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { aiApiKey: true },
  });

  return NextResponse.json({ hasKey: !!author?.aiApiKey });
}

/** POST — action: "test" | "save" | "remove" */
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, apiKey } = await req.json();

  // ── Remove key ───────────────────────────────────────────────────────────────
  if (action === "remove") {
    await prisma.author.update({ where: { id: authorId }, data: { aiApiKey: null } });
    return NextResponse.json({ ok: true });
  }

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required." }, { status: 400 });
  }

  // ── Test key ─────────────────────────────────────────────────────────────────
  if (action === "test" || action === "save") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("Say the word OK and nothing else.");
    } catch (err: any) {
      return NextResponse.json(
        { error: "Key test failed — the key appears to be invalid or has no Gemini access." },
        { status: 400 }
      );
    }

    if (action === "test") {
      return NextResponse.json({ ok: true, message: "Key is valid and working." });
    }

    // ── Save key ─────────────────────────────────────────────────────────────
    await prisma.author.update({
      where: { id: authorId },
      data:  { aiApiKey: encrypt(apiKey.trim()) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
