import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  authorId: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  categoryPrefs: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const subscriber = await prisma.subscriber.upsert({
      where: {
        authorId_email: {
          authorId: data.authorId,
          email: data.email,
        },
      },
      update: {
        name: data.name,
        categoryPrefs: data.categoryPrefs || [],
      },
      create: {
        authorId: data.authorId,
        name: data.name,
        email: data.email,
        categoryPrefs: data.categoryPrefs || [],
        isConfirmed: true, // Simple opt-in; add double opt-in via email confirmation token as enhancement
      },
    });

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
