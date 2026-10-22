// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TAX_CODES, taxCodeForFormat, taxCodeForDigitalBundle } from "@/lib/tax-codes";

describe("tax codes", () => {
  it("maps each sale format to its own Stripe tax code", () => {
    expect(taxCodeForFormat("EBOOK")).toBe("txcd_10302000");
    expect(taxCodeForFormat("AUDIO")).toBe("txcd_10301000");
    expect(taxCodeForFormat("PRINT")).toBe("txcd_35010000");
    expect(taxCodeForFormat("FLIPBOOK")).toBe("txcd_10302000");
  });

  it("never labels books as digital audio any more (txcd_10401100) except the unverified course line", () => {
    for (const f of ["EBOOK", "AUDIO", "PRINT", "FLIPBOOK"]) expect(taxCodeForFormat(f)).not.toBe("txcd_10401100");
    expect(TAX_CODES.COURSE_UNVERIFIED).toBe("txcd_10401100");
  });

  it("uses the audiobook code only for all-audio digital bundles", () => {
    expect(taxCodeForDigitalBundle(["AUDIO", "AUDIO"])).toBe("txcd_10301000");
    expect(taxCodeForDigitalBundle(["EBOOK", "AUDIO"])).toBe("txcd_10302000");
    expect(taxCodeForDigitalBundle(["EBOOK"])).toBe("txcd_10302000");
  });
});

// ── POST /api/admin/orders/[id]/ship ─────────────────────────────────────────

const findFirst = vi.fn();
const update = vi.fn().mockResolvedValue({ shippedAt: new Date(), trackingCarrier: null, trackingNumber: null });
const authorId = vi.fn();
const sendShipped = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/db", () => ({
  prisma: { order: { findFirst: (...a: unknown[]) => findFirst(...a), update: (...a: unknown[]) => update(...a) } },
}));
vi.mock("@/lib/admin-auth", () => ({ getAdminAuthorIdForApi: () => authorId() }));
vi.mock("@/lib/mailer", () => ({ sendOrderShippedEmail: (...a: unknown[]) => sendShipped(...a) }));

import { POST } from "@/app/api/admin/orders/[id]/ship/route";

function call(body: unknown) {
  const req = new Request("http://localhost/api/admin/orders/o1/ship", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
  return POST(req, { params: Promise.resolve({ id: "o1" }) });
}

const printOrder = {
  id: "o1",
  customerEmail: "buyer@example.com",
  customerName: "Jane",
  shippingAddress: { line1: "12 Main St" },
  shippedAt: null,
  trackingCarrier: null,
  trackingNumber: null,
  author: { displayName: "A. Author", name: "Author" },
  items: [{ book: { title: "My Book" }, saleItem: { format: "PRINT", label: "Paperback" } }],
};

beforeEach(() => {
  findFirst.mockReset();
  update.mockClear();
  sendShipped.mockClear();
  authorId.mockReset();
});

describe("POST /api/admin/orders/[id]/ship", () => {
  it("rejects signed-out requests", async () => {
    authorId.mockResolvedValue(null);
    expect((await call({})).status).toBe(401);
  });

  it("404s for an order that is not this author's", async () => {
    authorId.mockResolvedValue("a1");
    findFirst.mockResolvedValue(null);
    expect((await call({})).status).toBe(404);
    expect(findFirst.mock.calls[0][0].where).toMatchObject({ id: "o1", authorId: "a1" });
  });

  it("refuses digital-only orders (no shipping address)", async () => {
    authorId.mockResolvedValue("a1");
    findFirst.mockResolvedValue({ ...printOrder, shippingAddress: null });
    expect((await call({})).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("marks shipped, saves tracking and emails the buyer once", async () => {
    authorId.mockResolvedValue("a1");
    findFirst.mockResolvedValue(printOrder);
    const res = await call({ carrier: "USPS", trackingNumber: "9400 1" });
    expect(res.status).toBe(200);
    expect(update.mock.calls[0][0].data.trackingCarrier).toBe("USPS");
    expect(sendShipped).toHaveBeenCalledTimes(1);
    expect(sendShipped.mock.calls[0][0].to).toBe("buyer@example.com");
    expect(sendShipped.mock.calls[0][0].itemTitles).toEqual(["My Book (Paperback)"]);
  });

  it("does not email again when re-saved with the same tracking", async () => {
    authorId.mockResolvedValue("a1");
    findFirst.mockResolvedValue({ ...printOrder, shippedAt: new Date(), trackingCarrier: "USPS", trackingNumber: "9400 1" });
    await call({ carrier: "USPS", trackingNumber: "9400 1" });
    expect(sendShipped).not.toHaveBeenCalled();
  });

  it("can skip the email and can undo", async () => {
    authorId.mockResolvedValue("a1");
    findFirst.mockResolvedValue(printOrder);
    await call({ notify: false });
    expect(sendShipped).not.toHaveBeenCalled();
    update.mockClear();
    await call({ undo: true });
    expect(update.mock.calls[0][0].data).toEqual({ shippedAt: null, trackingCarrier: null, trackingNumber: null });
  });
});
