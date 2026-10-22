// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const findMany = vi.fn();
const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
const retrieve = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: { order: { findMany: (...a: unknown[]) => findMany(...a), deleteMany: (...a: unknown[]) => deleteMany(...a) } },
}));
vi.mock("@/lib/stripe", () => ({ stripe: { checkout: { sessions: { retrieve: (...a: unknown[]) => retrieve(...a) } } } }));

import { GET } from "@/app/api/cron/cleanup-abandoned-orders/route";

function req(auth?: string) {
  return new Request("http://localhost/api/cron/cleanup-abandoned-orders", {
    headers: auth ? { authorization: auth } : {},
  }) as never;
}

type Author = { stripeConnectAccountId: string | null; stripeConnectType: string | null };
const standard: Author = { stripeConnectAccountId: "acct_123", stripeConnectType: "standard" };
const order = (id: string, sessionId: string | null, author: Author = standard) => ({ id, stripeSessionId: sessionId, author });

beforeEach(() => {
  findMany.mockReset();
  deleteMany.mockReset().mockImplementation(async ({ where }) => ({ count: where.id.in.length }));
  retrieve.mockReset();
  process.env.CRON_SECRET = "s3cret";
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("GET /api/cron/cleanup-abandoned-orders", () => {
  it("rejects calls without the cron secret", async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer wrong"))).status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("only looks at PENDING orders older than 30 days", async () => {
    findMany.mockResolvedValue([]);
    const before = Date.now();
    await GET(req("Bearer s3cret"));
    const where = findMany.mock.calls[0][0].where;
    expect(where.status).toBe("PENDING");
    const days = (before - where.createdAt.lt.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(29.99);
    expect(days).toBeLessThan(30.01);
  });

  it("deletes unpaid/expired sessions and orders that never reached Stripe", async () => {
    findMany.mockResolvedValue([order("a", "cs_expired"), order("b", null)]);
    retrieve.mockResolvedValue({ status: "expired", payment_status: "unpaid" });
    const body = await (await GET(req("Bearer s3cret"))).json();
    expect(body).toMatchObject({ deleted: 2, keptPaid: 0, keptUnchecked: 0 });
    expect(deleteMany.mock.calls[0][0].where).toEqual({ id: { in: ["a", "b"] }, status: "PENDING" });
  });

  it("KEEPS an order Stripe says was paid (webhook never landed) and logs it", async () => {
    findMany.mockResolvedValue([order("paid1", "cs_paid"), order("gone", "cs_expired")]);
    retrieve.mockImplementation(async (id: string) =>
      id === "cs_paid" ? { status: "complete", payment_status: "paid" } : { status: "expired", payment_status: "unpaid" },
    );
    const body = await (await GET(req("Bearer s3cret"))).json();
    expect(body).toMatchObject({ deleted: 1, keptPaid: 1 });
    expect(deleteMany.mock.calls[0][0].where.id.in).toEqual(["gone"]);
    expect(console.error).toHaveBeenCalled();
  });

  it("keeps an order it cannot check with Stripe", async () => {
    findMany.mockResolvedValue([order("x", "cs_unknown")]);
    retrieve.mockRejectedValue(new Error("No such checkout.session"));
    const body = await (await GET(req("Bearer s3cret"))).json();
    expect(body).toMatchObject({ deleted: 0, keptUnchecked: 1 });
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("asks Stripe on the author's own account for direct-charge (Standard) authors", async () => {
    findMany.mockResolvedValue([order("a", "cs_1"), order("b", "cs_2", { stripeConnectAccountId: null, stripeConnectType: null })]);
    retrieve.mockResolvedValue({ status: "expired", payment_status: "unpaid" });
    await GET(req("Bearer s3cret"));
    expect(retrieve.mock.calls[0][2]).toEqual({ stripeAccount: "acct_123" });
    expect(retrieve.mock.calls[1][2]).toBeUndefined();
  });
});
