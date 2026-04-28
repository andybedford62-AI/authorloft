import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcDiscount } from "@/lib/discount-queries";

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
      include: { books: { select: { bookId: true } } },
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

    // Check book restriction (if books are specified, this book must be in the list)
    const restrictedBookIds = discount.books.map((b) => b.bookId);
    if (restrictedBookIds.length > 0 && !restrictedBookIds.includes(bookId)) {
      return NextResponse.json({ valid: false, error: "This code is not valid for this book." });
    }

    // Calculate discount using shared helper
    const { discountCents, finalPriceCents } = calcDiscount(
      saleItem.priceCents,
      discount.type,
      discount.value,
    );

    return NextResponse.json({
      valid:           true,
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
