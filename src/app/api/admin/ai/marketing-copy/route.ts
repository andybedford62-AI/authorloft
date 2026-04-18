import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CHANNEL_INSTRUCTIONS: Record<string, string> = {
  "Social Media":
    "Write 3 short, punchy social media posts optimised for Twitter/X and Instagram. Each post must be under 280 characters. Number them 1, 2, 3. Add 3-5 relevant hashtags to each.",
  "Email Newsletter":
    "Write an email newsletter promotion. Include: a compelling subject line (labelled 'Subject:'), a greeting, 2-3 paragraphs of engaging body copy, and a clear call-to-action.",
  "Amazon/Retail Page":
    "Write a full Amazon/retail product description of 200-300 words. Open with a strong hook, build intrigue, highlight key themes, and end with a compelling call-to-read.",
  "Press Release":
    "Write a standard press release with: a headline, dateline (use [CITY, DATE]), a 4-paragraph body (lead, background, quote from author, boilerplate), and a ### end marker.",
  "Author Website":
    "Write a homepage feature blurb of 100-150 words. It should be warm, inviting, and entice visitors to learn more about the book.",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookTitle, genre, hook, channel } = await req.json();

  if (!bookTitle?.trim()) {
    return NextResponse.json({ error: "Book title is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

  const channelKey    = channel?.trim() || "Social Media";
  const channelGuide  = CHANNEL_INSTRUCTIONS[channelKey] ?? CHANNEL_INSTRUCTIONS["Social Media"];

  const prompt = [
    "You are a professional book marketing copywriter.",
    "Generate compelling marketing copy for the following book:\n",
    `Book Title: ${bookTitle.trim()}`,
    genre?.trim() ? `Genre: ${genre.trim()}`                        : null,
    hook?.trim()  ? `Core Hook / Key Message: ${hook.trim()}`       : null,
    `Primary Channel: ${channelKey}`,
    "",
    channelGuide,
    "",
    "Output only the copy itself — no preamble, labels like 'Here is your copy:', or closing commentary.",
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
    console.error("[AI marketing-copy]", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
