import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const book = await prisma.book.findFirst({
    where: { id, authorId },
    select: {
      id: true, slug: true, affiliateEnabled: true, affiliateCommissionPercent: true,
      affiliateReferrals: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(book);
}

/** PATCH — update the book-level affiliate toggle + commission rate. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.book.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { affiliateEnabled, affiliateCommissionPercent } = body;

  if (
    affiliateCommissionPercent !== undefined &&
    (typeof affiliateCommissionPercent !== "number" || affiliateCommissionPercent < 1 || affiliateCommissionPercent > 50)
  ) {
    return NextResponse.json({ error: "Commission must be between 1% and 50%." }, { status: 400 });
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...(typeof affiliateEnabled === "boolean" && { affiliateEnabled }),
      ...(typeof affiliateCommissionPercent === "number" && { affiliateCommissionPercent }),
    },
    select: { id: true, affiliateEnabled: true, affiliateCommissionPercent: true },
  });

  return NextResponse.json(updated);
}

/** POST — create a new referral code/link for this book. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await prisma.book.findFirst({ where: { id, authorId } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const label: string = (body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "A name/label is required for the referral link." }, { status: 400 });

  let refCode = slugify(label).slice(0, 40) || "referrer";
  let suffix = 0;
  // Ensure uniqueness per book
  while (
    await prisma.affiliateReferral.findUnique({ where: { bookId_refCode: { bookId: id, refCode } } })
  ) {
    suffix++;
    refCode = `${slugify(label).slice(0, 40) || "referrer"}-${suffix}`;
  }

  const referral = await prisma.affiliateReferral.create({
    data: { bookId: id, refCode, label },
  });

  return NextResponse.json(referral);
}

export async function DELETE(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const referralId = searchParams.get("referralId");
  if (!referralId) return NextResponse.json({ error: "referralId is required" }, { status: 400 });

  const referral = await prisma.affiliateReferral.findUnique({
    where: { id: referralId },
    select: { id: true, book: { select: { authorId: true } } },
  });
  if (!referral || referral.book.authorId !== authorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.affiliateReferral.delete({ where: { id: referralId } });
  return NextResponse.json({ ok: true });
}
