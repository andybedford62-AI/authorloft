import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcDiscount } from "@/lib/discount-queries";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";

const DISCOUNT_CODE_REGEX = /^[A-Z0-9-]+$/;

/**
 * POST /api/checkout/validate-discount
 *
 * Validates a discount code for one or more sale items (cart).
 * Body: { code: string; saleItemIds: string[] }
 *   or legacy: { code: string; saleItemId: string }
 * Returns: { valid: true; type; value; discountCents; finalTotal; description? }
 *       or { valid: false; error: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit — discount codes could otherwise be brute-forced
    const rateLimitKey = getRateLimitKey(req, "ip", "validate-discount");
    const rateLimitResult = await checkRateLimit(rateLimitKey, RATE_LIMITS.subscribe);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const { code } = body;

    // Support both new array format and legacy single-item format
    let saleItemIds: string[];
    if (Array.isArray(body.saleItemIds) && body.saleItemIds.length > 0) {
      saleItemIds = body.saleItemIds;
    } else if (typeof body.saleItemId === "string") {
      saleItemIds = [body.saleItemId];
    } else {
      return NextResponse.json({ valid: false, error: "Missing code or items." }, { status: 400 });
    }

    if (typeof code !== "string" || !code.trim() || code.length > 50 || !DISCOUNT_CODE_REGEX.test(code.trim().toUpperCase())) {
      return NextResponse.json({ valid: false, error: "Invalid or missing discount code." }, { status: 400 });
    }

    // Load all sale items
    const saleItems = await prisma.bookDirectSaleItem.findMany({
      where: { id: { in: saleItemIds }, isActive: true },
      select: {
        id:         true,
        priceCents: true,
        book:       { select: { authorId: true, id: true } },
      },
    });

    if (saleItems.length === 0) {
      return NextResponse.json({ valid: false, error: "Items not found." }, { status: 404 });
    }

    const authorId = saleItems[0].book.authorId;

    // Look up discount code
    const discount = await prisma.discountCode.findUnique({
      where: { authorId_code: { authorId, code: code.trim().toUpperCase() } },
      include: { books: { select: { bookId: true } } },
    });

    if (!discount || !discount.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive discount code." }, { status: 400 });
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This discount code has expired." }, { status: 400 });
    }

    if (discount.maxUses !== null && discount.usesCount >= discount.maxUses) {
      return NextResponse.json({ valid: false, error: "This discount code has reached its usage limit." }, { status: 400 });
    }

    // Calculate discount across all qualifying items
    const restrictedBookIds = discount.books.map((b) => b.bookId);

    let totalDiscountCents = 0;
    let totalOriginalCents = 0;
    let anyApplied         = false;

    for (const item of saleItems) {
      totalOriginalCents += item.priceCents;
      const bookAllowed =
        restrictedBookIds.length === 0 || restrictedBookIds.includes(item.book.id);

      if (bookAllowed) {
        const { discountCents } = calcDiscount(item.priceCents, discount.type, discount.value);
        totalDiscountCents += discountCents;
        anyApplied = true;
      }
    }

    if (!anyApplied) {
      return NextResponse.json({ valid: false, error: "This code is not valid for any items in your cart." }, { status: 400 });
    }

    const finalTotal = Math.max(0, totalOriginalCents - totalDiscountCents);

    return NextResponse.json({
      valid:         true,
      discountId:    discount.id,
      type:          discount.type,
      value:         discount.value,
      discountCents: totalDiscountCents,
      finalTotal,
      // Legacy field for single-item buy page compatibility
      finalPriceCents: finalTotal,
      description:   discount.description ?? null,
    });
  } catch (err: any) {
    console.error("[validate-discount]", err);
    return NextResponse.json({ valid: false, error: "Something went wrong." }, { status: 500 });
  }
}
