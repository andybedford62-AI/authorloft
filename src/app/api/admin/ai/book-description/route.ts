import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookTitle, genre, themes, audience } = await req.json();

  if (!bookTitle?.trim()) {
    return NextResponse.json({ error: "Book title is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

  const prompt = [
    "You are a professional book description copywriter for authors.",
    "Write a compelling, engaging book description based on the following details.\n",
    `Book Title: ${bookTitle.trim()}`,
    genre?.trim()    ? `Genre: ${genre.trim()}`                        : null,
    themes?.trim()   ? `Key Themes / Plot Points: ${themes.trim()}`    : null,
    audience?.trim() ? `Target Audience: ${audience.trim()}`           : null,
    "",
    "Write a single flowing description of approximately 200–250 words.",
    "- Open with a powerful hook that draws the reader in immediately",
    "- Build intrigue, tension, or emotional resonance",
    "- End with a compelling reason to read the book",
    "- Write in third person",
    "- Do not use headers, bullet points, or the book title as the first word",
    "- Do not add any preamble or commentary — output only the description itself",
  ].filter(Boolean).join("\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
    const model = genAI.getGenerativeModel({ model: modelName });

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
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("[AI book-description]", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
