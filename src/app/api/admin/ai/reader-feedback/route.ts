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

  const prompt = `You are an expert literary analyst and author coach. Analyse the following reader feedback and provide a structured report.

Reader Reviews / Feedback:
${feedback.trim()}

Provide a structured analysis using exactly this format:

### Analysis of Reader Feedback

1. **OVERALL SENTIMENT**
   - State whether sentiment is Positive, Negative, Mixed, or Neutral, and explain briefly.

2. **TOP PRAISE THEMES**
   - List the key things readers praised. If none are present, state that clearly.

3. **TOP CRITICISM THEMES**
   - List the key concerns or criticisms raised, with a brief explanation of each.

4. **EMOTIONAL RESPONSE**
   - Describe the emotional tone of the feedback and how readers connected with the book.

5. **ACTIONABLE INSIGHTS**
   - Provide 3-5 specific, practical recommendations the author can act on based on this feedback.

Use markdown formatting throughout. Be thorough but concise. Do not add any preamble before the heading.`;

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
