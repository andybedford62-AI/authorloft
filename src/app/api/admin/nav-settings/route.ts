import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/nav-settings — fetch current nav visibility settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
    },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(author);
}

// PUT /api/admin/nav-settings — update nav visibility toggles
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const authorId = (session.user as any).id as string;

  const body = await req.json();
  const {
    navShowAbout,
    navShowBooks,
    navShowSpecials,
    navShowFlipBooks,
    navShowBlog,
    navShowContact,
  } = body;

  const updated = await prisma.author.update({
    where: { id: authorId },
    data: {
      ...(typeof navShowAbout     === "boolean" && { navShowAbout }),
      ...(typeof navShowBooks     === "boolean" && { navShowBooks }),
      ...(typeof navShowSpecials  === "boolean" && { navShowSpecials }),
      ...(typeof navShowFlipBooks === "boolean" && { navShowFlipBooks }),
      ...(typeof navShowBlog      === "boolean" && { navShowBlog }),
      ...(typeof navShowContact   === "boolean" && { navShowContact }),
    },
    select: {
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
    },
  });

  return NextResponse.json(updated);
}
