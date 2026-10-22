import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const MAX_CENTS = 10_000; // $100: a sanity cap on a flat shipping fee

// GET /api/admin/settings/print-shipping -> { printShippingCents: number | null }
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const author = await prisma.author.findUnique({ where: { id: authorId }, select: { printShippingCents: true } });
  return NextResponse.json({ printShippingCents: author?.printShippingCents ?? null });
}

// PUT { printShippingCents: number | null } — flat fee added once per order that contains a print item.
// null or 0 = free shipping.
export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const raw = body.printShippingCents;
  if (raw !== null && (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0 || raw > MAX_CENTS)) {
    return NextResponse.json({ error: "Shipping must be between $0 and $100." }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data: { printShippingCents: raw === 0 ? null : raw },
  });
  return NextResponse.json({ ok: true, printShippingCents: raw === 0 ? null : raw });
}
