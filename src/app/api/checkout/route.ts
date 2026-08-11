import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { calcDiscount } from "@/lib/discount-queries";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import { auditLog, getAuditContext } from "@/lib/audit-logger";
import { validateCheckoutRequest } from "@/lib/schemas/checkout";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/checkout
 *
 * Creates a pending Order and starts a Stripe Checkout session.
 * Returns the Stripe-hosted payment page URL.
 *
 * Body: { items: [{ saleItemId: string }], discountCode?: string }
 *   or legacy: { saleItemId: string, discountCode?: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Rate Limiting ──────────────────────────────────────────────────────
    const rateLimitKey = getRateLimitKey(req, "ip", "checkout");
    const rateLimitResult = await checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.checkout
    );

    if (!rateLimitResult.allowed) {
      console.warn("[checkout] Rate limit exceeded:", { rateLimitKey });
      return NextResponse.json(
        {
          error: "Too many checkout attempts. Please try again in a moment.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
            "RateLimit-Limit": rateLimitResult.limit.toString(),
            "RateLimit-Remaining": "0",
            "RateLimit-Reset": Math.floor(rateLimitResult.resetAt / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();

    // ── Input Validation ───────────────────────────────────────────────────
    const validationResult = validateCheckoutRequest(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid checkout request",
          details: validationResult.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedBody = validationResult.data;

    // ── Course checkout path ─────────────────────────────────────────────
    if (validatedBody.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: validatedBody.courseId },
        include: {
          author: {
            select: {
              id: true,
              slug: true,
              stripeConnectAccountId: true,
              stripeConnectOnboarded: true,
              plan: { select: { coursesEnabled: true } },
            },
          },
        },
      });

      if (!course || !course.isPublished) {
        return NextResponse.json({ error: "Course not found." }, { status: 404 });
      }
      if (!course.author.plan?.coursesEnabled) {
        return NextResponse.json({ error: "Courses are not enabled for this author." }, { status: 400 });
      }
      if (course.priceCents <= 0) {
        return NextResponse.json({ error: "Free course enrollment is handled separately." }, { status: 400 });
      }

      const author = course.author;

      // ── Resolve discount code ─────────────────────────────────────────
      let courseDiscountId: string | null = null;
      let courseDiscountCents = 0;

      if (validatedBody.discountCode && typeof validatedBody.discountCode === "string") {
        const foundDiscount = await prisma.discountCode.findUnique({
          where: {
            authorId_code: {
              authorId: author.id,
              code: validatedBody.discountCode.trim().toUpperCase(),
            },
          },
          include: { courses: { select: { courseId: true } } },
        });

        const isValidDiscount =
          foundDiscount &&
          foundDiscount.isActive &&
          (!foundDiscount.expiresAt || foundDiscount.expiresAt >= new Date()) &&
          (foundDiscount.maxUses === null || foundDiscount.usesCount < foundDiscount.maxUses);

        if (isValidDiscount && foundDiscount) {
          const restrictedCourseIds = foundDiscount.courses.map((c) => c.courseId);
          const courseAllowed = restrictedCourseIds.length === 0 || restrictedCourseIds.includes(course.id);
          if (courseAllowed) {
            courseDiscountId = foundDiscount.id;
            courseDiscountCents = calcDiscount(course.priceCents, foundDiscount.type, foundDiscount.value).discountCents;
          }
        }
      }

      const totalCents = Math.max(50, course.priceCents - courseDiscountCents);
      const baseUrl = `https://${author.slug}.${PLATFORM_DOMAIN}`;
      const successUrl = `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/courses/${course.slug}`;
      const feePct = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "10") / 100;
      const platformFeeCents = Math.round(totalCents * feePct);
      const useConnect = !!author.stripeConnectAccountId && author.stripeConnectOnboarded;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        billing_address_collection: "required",
        automatic_tax: { enabled: true },
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: totalCents,
            product_data: {
              name: course.title,
              description: "Online course — lifetime access",
              tax_code: "txcd_10401100",
            },
          },
          quantity: 1,
        }],
        metadata: {
          type: "course_purchase",
          authorId: author.id,
          courseId: course.id,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(useConnect && {
          payment_intent_data: {
            application_fee_amount: platformFeeCents,
            transfer_data: { destination: author.stripeConnectAccountId! },
          },
        }),
      });

      await prisma.order.create({
        data: {
          authorId: author.id,
          customerEmail: "",
          totalCents,
          discountCents: courseDiscountCents,
          ...(courseDiscountId && { discountCodeId: courseDiscountId }),
          stripeSessionId: session.id,
          status: "PENDING",
          items: {
            create: [{
              itemType: "COURSE",
              courseId: course.id,
              priceCents: totalCents,
            }],
          },
        },
      });

      const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const auditContext = getAuditContext(req);
      auditLog({
        userId: sessionToken?.sub,
        action: "Create checkout session",
        endpoint: "/api/checkout",
        method: req.method,
        statusCode: 200,
        ...auditContext,
        metadata: { courseId: course.id, totalCents },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Bundle checkout path ──────────────────────────────────────────────
    let bundleRecord: { id: string; title: string; priceCents: number; coverImageUrl: string | null } | null = null;

    let saleItemIds: string[];
    if (validatedBody.bundleId) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: validatedBody.bundleId },
        include: {
          items: { include: { saleItem: { select: { id: true } } }, orderBy: { sortOrder: "asc" } },
          author: { select: { id: true, slug: true, stripeConnectAccountId: true, stripeConnectOnboarded: true, plan: { select: { bundlesEnabled: true } } } },
        },
      });

      if (!bundle || !bundle.isPublished) {
        return NextResponse.json({ error: "Bundle not found." }, { status: 404 });
      }
      if (!bundle.author.plan?.bundlesEnabled) {
        return NextResponse.json({ error: "Bundles are not enabled for this author." }, { status: 400 });
      }

      saleItemIds = bundle.items.map((i) => i.saleItem.id);
      bundleRecord = { id: bundle.id, title: bundle.title, priceCents: bundle.priceCents, coverImageUrl: bundle.coverImageUrl };
    } else if (validatedBody.items && validatedBody.items.length > 0) {
      saleItemIds = validatedBody.items.map((i) => i.saleItemId);
    } else if (validatedBody.saleItemId) {
      saleItemIds = [validatedBody.saleItemId];
    } else {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    if (saleItemIds.length === 0) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 });
    }

    const { discountCode } = validatedBody;

    // Load all sale items with their books and author
    const saleItems = await prisma.bookDirectSaleItem.findMany({
      where: { id: { in: saleItemIds }, isActive: true },
      include: {
        book: {
          include: {
            author: {
              select: {
                id: true,
                slug: true,
                stripeConnectAccountId: true,
                stripeConnectOnboarded: true,
              },
            },
          },
        },
      },
    });

    // ── Affiliate referral attribution (cookie set by AffiliateRefTracker) ───
    let affiliateBookId: string | null = null;
    let affiliateRefCode: string | null = null;
    const refCookie = req.cookies.get("al_ref")?.value;
    if (refCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(refCookie));
        if (parsed?.bookId && parsed?.refCode) {
          affiliateBookId = String(parsed.bookId);
          affiliateRefCode = String(parsed.refCode).slice(0, 60);
        }
      } catch {
        // ignore malformed cookie
      }
    }

    if (saleItems.length === 0) {
      return NextResponse.json({ error: "No valid items found." }, { status: 404 });
    }

    // All items must belong to the same author (single checkout session)
    const authorId = saleItems[0].book.author.id;
    if (saleItems.some((i) => i.book.author.id !== authorId)) {
      return NextResponse.json({ error: "All items must be from the same author." }, { status: 400 });
    }

    const author = saleItems[0].book.author;

    // Validate each item
    for (const item of saleItems) {
      if (!item.book.isPublished || !item.book.directSalesEnabled) {
        return NextResponse.json(
          { error: `Direct sales are not enabled for "${item.book.title}".` },
          { status: 400 }
        );
      }
      if (item.format !== "PRINT" && !item.fileKey) {
        return NextResponse.json(
          { error: `The download file for "${item.label}" hasn't been uploaded yet. Please check back soon.` },
          { status: 400 }
        );
      }
      if (item.priceCents <= 0) {
        return NextResponse.json(
          { error: `Free items are not yet supported via this flow.` },
          { status: 400 }
        );
      }
    }

    // ── Resolve discount code ─────────────────────────────────────────────────
    type DiscountWithBooks = {
      id: string;
      type: string;
      value: number;
      isActive: boolean;
      expiresAt: Date | null;
      maxUses: number | null;
      usesCount: number;
      books: { bookId: string }[];
      bundles: { bundleId: string }[];
    };

    let discount: DiscountWithBooks | null = null;

    if (discountCode && typeof discountCode === "string") {
      const found = await prisma.discountCode.findUnique({
        where: {
          authorId_code: {
            authorId,
            code: discountCode.trim().toUpperCase(),
          },
        },
        include: {
          books: { select: { bookId: true } },
          bundles: { select: { bundleId: true } },
        },
      });

      const isValid =
        found &&
        found.isActive &&
        (!found.expiresAt || found.expiresAt >= new Date()) &&
        (found.maxUses === null || found.usesCount < found.maxUses);

      if (isValid && found) discount = found;
    }

    // ── Calculate per-item price after discount ───────────────────────────────
    let hasBelowMinimumPricing = false;

    let lineItems: { item: typeof saleItems[0]; itemPrice: number; itemDiscount: number; originalPrice: number }[];
    let discountedBundleTotal = bundleRecord ? bundleRecord.priceCents : 0;

    if (bundleRecord) {
      let bundleDiscountCents = 0;
      if (discount) {
        const restrictedBundleIds = discount.bundles.map((b) => b.bundleId);
        const bundleAllowed = restrictedBundleIds.length === 0 || restrictedBundleIds.includes(bundleRecord.id);
        if (bundleAllowed) {
          bundleDiscountCents = calcDiscount(bundleRecord.priceCents, discount.type, discount.value).discountCents;
        }
      }
      discountedBundleTotal = Math.max(50, bundleRecord.priceCents - bundleDiscountCents);

      const perItemPrice = Math.max(1, Math.round(discountedBundleTotal / saleItems.length));
      const perItemDiscount = Math.round(bundleDiscountCents / saleItems.length);
      lineItems = saleItems.map((item) => ({
        item,
        itemPrice: perItemPrice,
        itemDiscount: perItemDiscount,
        originalPrice: item.priceCents,
      }));
    } else {
      lineItems = saleItems.map((item) => {
        const originalPrice = item.priceCents;
        let itemPrice = Math.max(50, item.priceCents);
        let itemDiscount = 0;

        if (originalPrice < 50) {
          hasBelowMinimumPricing = true;
        }

        if (discount) {
          const restrictedBookIds = discount.books.map((b) => b.bookId);
          const bookAllowed =
            restrictedBookIds.length === 0 || restrictedBookIds.includes(item.book.id);

          if (bookAllowed) {
            const calc = calcDiscount(itemPrice, discount.type, discount.value);
            itemDiscount = calc.discountCents;
            itemPrice    = Math.max(50, calc.finalPriceCents);
          }
        }

        return { item, itemPrice, itemDiscount, originalPrice };
      });
    }

    const totalCents    = bundleRecord ? discountedBundleTotal : lineItems.reduce((s, l) => s + l.itemPrice, 0);
    const discountCents = bundleRecord
      ? bundleRecord.priceCents - discountedBundleTotal
      : lineItems.reduce((s, l) => s + l.itemDiscount, 0);
    const discountCodeId = discount ? discount.id : null;

    // Build redirect URLs from the first item's book (or use author slug directly)
    const baseUrl    = `https://${author.slug}.${PLATFORM_DOMAIN}`;
    const successUrl = `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${baseUrl}/books`;

    const feePct           = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "10") / 100;
    const platformFeeCents = Math.round(totalCents * feePct);
    const useConnect       = !!author.stripeConnectAccountId && author.stripeConnectOnboarded;

    // Build Stripe line items
    const stripeLineItems = bundleRecord
      ? [{
          price_data: {
            currency:     "usd",
            unit_amount:  totalCents,
            product_data: {
              name:     bundleRecord.title,
              description: `Bundle — ${saleItems.length} items included`,
              tax_code: "txcd_10401100",
            },
          },
          quantity: 1,
        }]
      : lineItems.map(({ item, itemPrice }) => ({
          price_data: {
            currency:     "usd",
            unit_amount:  itemPrice,
            product_data: {
              name:     `${item.book.title} — ${item.label}`,
              ...(item.description ? { description: item.description } : {}),
              tax_code: "txcd_10401100",
            },
          },
          quantity: 1,
        }));

    // Include all saleItemIds in metadata (comma-separated for webhook)
    const session = await stripe.checkout.sessions.create({
      payment_method_types:     ["card"],
      mode:                     "payment",
      billing_address_collection: "required",
      automatic_tax:            { enabled: true },
      line_items:               stripeLineItems,
      metadata: {
        type:        bundleRecord ? "bundle_purchase" : "book_purchase",
        authorId,
        saleItemIds: saleItemIds.join(","),
        saleItemId:  saleItemIds[0],
        bookId:      saleItems[0].book.id,
        ...(bundleRecord && { bundleId: bundleRecord.id }),
        hasBelowMinimumPricing: hasBelowMinimumPricing ? "true" : "false",
        ...(affiliateBookId && affiliateRefCode && saleItems.some((i) => i.book.id === affiliateBookId && i.book.affiliateEnabled) && {
          affiliateBookId,
          affiliateRefCode,
        }),
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
      ...(useConnect && {
        payment_intent_data: {
          application_fee_amount: platformFeeCents,
          transfer_data: { destination: author.stripeConnectAccountId! },
        },
      }),
    });

    // Create PENDING order with all items
    await prisma.order.create({
      data: {
        authorId,
        customerEmail:   "",
        totalCents,
        discountCents,
        ...(discountCodeId && { discountCodeId }),
        stripeSessionId: session.id,
        status:          "PENDING",
        items: {
          create: lineItems.map(({ item, itemPrice }) => ({
            itemType:   bundleRecord ? "BUNDLE" : "BOOK",
            bookId:     item.book.id,
            saleItemId: item.id,
            bundleId:   bundleRecord?.id ?? null,
            priceCents: itemPrice,
            fileKey:    item.fileKey ?? null,
          })),
        },
      },
    });

    // ── Audit Log ──────────────────────────────────────────────────────
    const sessionToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const auditContext = getAuditContext(req);
    auditLog({
      userId: sessionToken?.sub,
      action: "Create checkout session",
      endpoint: "/api/checkout",
      method: req.method,
      statusCode: 200,
      ...auditContext,
      metadata: {
        saleItemIds: saleItemIds.slice(0, 3), // First 3 items only
        itemCount: saleItemIds.length,
        totalCents,
        hasDiscount: !!discountCodeId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[checkout] Error:", msg);

    // ── Audit Log for Error ─────────────────────────────────────────────
    const sessionToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const auditContext = getAuditContext(req);
    auditLog({
      userId: sessionToken?.sub,
      action: "Create checkout session",
      endpoint: "/api/checkout",
      method: req.method,
      statusCode: 500,
      errorMessage: msg,
      ...auditContext,
    });

    return NextResponse.json(
      { error: "We couldn't complete your checkout. Please try again, or contact support if this continues." },
      { status: 500 }
    );
  }
}
