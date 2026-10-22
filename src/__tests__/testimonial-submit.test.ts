// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const create = vi.fn().mockResolvedValue({});
vi.mock("@/lib/db", () => ({
  prisma: {
    testimonial: { create: (...a: unknown[]) => create(...a) },
    platformSettings: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));
const sendMail = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/mailer", () => ({
  sendMail: (...a: unknown[]) => sendMail(...a),
  esc: (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
}));

import { POST } from "@/app/api/marketing/testimonial/route";

let ipCounter = 0;
function req(body: unknown) {
  // A fresh IP per call so the in-memory rate limit doesn't interfere.
  return new Request("http://localhost/api/marketing/testimonial", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ipCounter}` },
    body: JSON.stringify(body),
  }) as never;
}

const good = {
  name: "Jane Smith",
  email: "jane@example.com",
  role: "Fantasy author, 3 books",
  quote: "I set up my site in an afternoon and made my first direct sale that week.",
  consent: true,
};

beforeEach(() => {
  create.mockClear();
  sendMail.mockClear();
});

describe("POST /api/marketing/testimonial", () => {
  it("saves a valid submission as inactive, with consent and source", async () => {
    const res = await POST(req(good));
    expect(res.status).toBe(200);
    const data = create.mock.calls[0][0].data;
    expect(data.isActive).toBe(false);
    expect(data.consentToPublish).toBe(true);
    expect(data.source).toBe("share-your-story");
    expect(data.submitterEmail).toBe("jane@example.com");
  });

  it("escapes HTML in the quote", async () => {
    await POST(req({ ...good, quote: "<script>alert(1)</script> this tool is genuinely great for me" }));
    const quote: string = create.mock.calls[0][0].data.quote;
    expect(quote).not.toContain("<script>");
    expect(quote.startsWith("<p>")).toBe(true);
  });

  it("stores an optional 1-5 star rating and rejects anything else", async () => {
    await POST(req({ ...good, rating: 5 }));
    expect(create.mock.calls[0][0].data.rating).toBe(5);
    create.mockClear();
    await POST(req(good));
    expect(create.mock.calls[0][0].data.rating).toBeNull();
    create.mockClear();
    expect((await POST(req({ ...good, rating: 0 }))).status).toBe(400);
    expect((await POST(req({ ...good, rating: 6 }))).status).toBe(400);
    expect((await POST(req({ ...good, rating: "5" }))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("emails a copy back to the submitter", async () => {
    await POST(req({ ...good, rating: 4 }));
    const toSubmitter = sendMail.mock.calls.map((c) => c[0]).find((m) => m.to === "jane@example.com");
    expect(toSubmitter).toBeTruthy();
    expect(toSubmitter.text).toContain(good.quote);
    expect(toSubmitter.text).toContain("4 out of 5");
  });

  it("does not email anyone for honeypot or invalid submissions", async () => {
    await POST(req({ ...good, website: "http://spam.example" }));
    await POST(req({ ...good, consent: false }));
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("requires consent", async () => {
    const res = await POST(req({ ...good, consent: false }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a bad email and a too-short quote", async () => {
    expect((await POST(req({ ...good, email: "nope" }))).status).toBe(400);
    expect((await POST(req({ ...good, quote: "great" }))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(req({ ...good, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(create).not.toHaveBeenCalled();
  });
});
