import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
