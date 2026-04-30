import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/nav-settings — fetch current nav visibility settings
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
      navShowMediaKit: true,
    },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(author);
}

// PUT /api/admin/nav-settings — update nav visibility toggles
export async function PUT(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    navShowAbout,
    navShowBooks,
    navShowSpecials,
    navShowFlipBooks,
    navShowBlog,
    navShowContact,
    navShowMediaKit,
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
      ...(typeof navShowMediaKit  === "boolean" && { navShowMediaKit }),
    },
    select: {
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
      navShowMediaKit: true,
    },
  });

  return NextResponse.json(updated);
}
