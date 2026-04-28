import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/checkout/validate-discount
 *
 * Validates a discount code for a given sale item.
 * Body: { code: string; saleItemId: string }
 * Returns: { valid: true; type; value; discountCents; finalPriceCents; description? }
 *       or { valid: false; error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { code, saleItemId } = await req.json();

    if (!code || !saleItemId) {
      return NextResponse.json({ valid: false, error: "Missing code or item." }, { status: 400 });
    }

    // Load the sale item to get price and authorId
    const saleItem = await prisma.bookDirectSaleItem.findUnique({
      where: { id: saleItemId },
      select: {
        priceCents: true,
        isActive: true,
        book: { select: { authorId: true, id: true } },
      },
    });

    if (!saleItem || !saleItem.isActive) {
      return NextResponse.json({ valid: false, error: "Item not found." }, { status: 404 });
    }

    const authorId = saleItem.book.authorId;
    const bookId   = saleItem.book.id;

    // Look up the discount code for this author (case-insensitive)
    const discount = await prisma.discountCode.findUnique({
      where: { authorId_code: { authorId, code: code.trim().toUpperCase() } },
    });

    if (!discount || !discount.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive discount code." });
    }

    // Check expiry
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This discount code has expired." });
    }

    // Check usage limit
    if (discount.maxUses !== null && discount.usesCount >= discount.maxUses) {
      return NextResponse.json({ valid: false, error: "This discount code has reached its usage limit." });
    }

    // Check book restriction
    if (discount.bookId && discount.bookId !== bookId) {
      return NextResponse.json({ valid: false, error: "This code is not valid for this book." });
    }

    // Calculate discount amount
    let discountCents: number;
    if (discount.type === "PERCENT") {
      discountCents = Math.round(saleItem.priceCents * (discount.value / 100));
    } else {
      discountCents = Math.min(discount.value, saleItem.priceCents);
    }

    const finalPriceCents = Math.max(0, saleItem.priceCents - discountCents);

    return NextResponse.json({
      valid: true,
      discountId:      discount.id,
      type:            discount.type,
      value:           discount.value,
      discountCents,
      finalPriceCents,
      description:     discount.description ?? null,
    });
  } catch (err: any) {
    console.error("[validate-discount]", err);
    return NextResponse.json({ valid: false, error: "Something went wrong." }, { status: 500 });
  }
}
