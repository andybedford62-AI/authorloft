import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      pressTitle:      true,
      pressBio:        true,
      pressContact:    true,
      profileImageUrl: true,
      displayName:     true,
      name:            true,
    },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(author);
}

export async function PATCH(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { pressTitle, pressBio, pressContact } = body;

  const updated = await prisma.author.update({
    where: { id: authorId },
    data: {
      ...(typeof pressTitle   === "string" && { pressTitle:   pressTitle.trim()   || null }),
      ...(typeof pressBio     === "string" && { pressBio:     pressBio.trim()     || null }),
      ...(typeof pressContact === "string" && { pressContact: pressContact.trim() || null }),
    },
    select: {
      pressTitle:   true,
      pressBio:     true,
      pressContact: true,
    },
  });

  return NextResponse.json(updated);
}
