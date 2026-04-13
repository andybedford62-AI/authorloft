import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Series name is required." }, { status: 400 });
  }

  const slug = slugify(name);

  const existing = await prisma.series.findUnique({
    where: { authorId_slug: { authorId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "A series with that name already exists." }, { status: 409 });
  }

  const series = await prisma.series.create({
    data: { authorId, name: name.trim(), slug, description: description || null },
  });

  return NextResponse.json(series, { status: 201 });
}
