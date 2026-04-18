import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, description, tone, audience, numIdeas, keywords } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

  const count = Math.min(Math.max(parseInt(numIdeas) || 5, 1), 20);

  const prompt = [
    "You are a creative content strategist for authors.",
    `Generate exactly ${count} blog post ideas for an author based on the following:\n`,
    `Topic: ${topic.trim()}`,
    description?.trim() ? `Additional Context: ${description.trim()}` : null,
    audience?.trim()    ? `Target Audience: ${audience.trim()}`       : null,
    tone?.trim()        ? `Tone / Style: ${tone.trim()}`              : null,
    keywords?.trim()    ? `Keywords to include: ${keywords.trim()}`   : null,
    "",
    "For each idea provide:",
    "- A compelling blog post title",
    "- A 1-2 sentence description of what the post would cover",
    "",
    "Format as a numbered list. Do not add any preamble, introduction, or closing commentary.",
  ].filter(Boolean).join("\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":      "text/plain; charset=utf-8",
        "Cache-Control":     "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("[AI blog-ideas]", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
