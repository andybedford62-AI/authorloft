import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";

const BOOKS_INCLUDE = {
  books: { include: { book: { select: { id: true, title: true } } } },
} as const;

// GET /api/admin/discount-codes — list all codes for the author
export async function GET() {
  try {
    const authorId = await getAdminAuthorId();
    const codes = await prisma.discountCode.findMany({
      where: { authorId },
      include: BOOKS_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(codes);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/admin/discount-codes — create a new code
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorId();
    const body = await req.json();

    const {
      code,
      description,
      type,
      value,
      maxUses,
      expiresAt,
      bookIds,
      showAsSalePrice,
    } = body;

    if (!code || !type || !value) {
      return NextResponse.json({ error: "code, type, and value are required." }, { status: 400 });
    }

    if (type !== "PERCENT" && type !== "FIXED") {
      return NextResponse.json({ error: "type must be PERCENT or FIXED." }, { status: 400 });
    }

    if (type === "PERCENT" && (value < 1 || value > 100)) {
      return NextResponse.json({ error: "Percent discount must be between 1 and 100." }, { status: 400 });
    }

    if (type === "FIXED" && value < 1) {
      return NextResponse.json({ error: "Fixed discount must be at least $0.01." }, { status: 400 });
    }

    const upperCode = code.trim().toUpperCase().replace(/\s+/g, "");
    const safeBookIds: string[] = Array.isArray(bookIds) ? bookIds : [];

    const newCode = await prisma.discountCode.create({
      data: {
        authorId,
        code:            upperCode,
        description:     description?.trim() || null,
        type,
        value:           Number(value),
        maxUses:         maxUses ? Number(maxUses) : null,
        expiresAt:       expiresAt ? new Date(expiresAt) : null,
        showAsSalePrice: showAsSalePrice ?? false,
        books: safeBookIds.length > 0
          ? { create: safeBookIds.map((bid: string) => ({ bookId: bid })) }
          : undefined,
      },
      include: BOOKS_INCLUDE,
    });

    return NextResponse.json(newCode, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
    }
    console.error("[discount-codes POST]", err);
    return NextResponse.json({ error: "Could not create discount code." }, { status: 500 });
  }
}
