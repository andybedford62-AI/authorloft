import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedback } = await req.json();

  if (!feedback?.trim()) {
    return NextResponse.json({ error: "Reader feedback is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

  const prompt = `You are a literary analyst and reader research specialist. Analyze the following reader feedback/reviews for an author's book.

READER FEEDBACK:
${feedback.trim()}

Please provide a structured analysis:

1. OVERALL SENTIMENT — Positive / Mixed / Negative with a brief summary
2. TOP PRAISE THEMES — What readers consistently loved (bullet points)
3. TOP CRITICISM THEMES — Recurring concerns or complaints (bullet points)
4. EMOTIONAL RESPONSE — How readers felt (engaged, emotional, confused, etc.)
5. ACTIONABLE INSIGHTS — 3 concrete suggestions the author can act on for future books or marketing

Be concise and specific. Quote short phrases from the feedback where relevant. Do not add any preamble before item 1.`;

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
    console.error("[AI reader-feedback]", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
