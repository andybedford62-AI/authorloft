import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, esc } from "@/lib/mailer";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(ip, hits);
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/marketing/testimonial — a testimonial submitted from /share-your-story.
// Saved INACTIVE: nothing is shown on the site until the Super Admin reviews it and switches it on.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, email, role, quote, consent, website } = body as Record<string, unknown>;

  // Honeypot: real people never see or fill this field. Pretend success so bots don't retry.
  if (typeof website === "string" && website.trim()) return NextResponse.json({ ok: true });

  const n = typeof name === "string" ? name.trim() : "";
  const e = typeof email === "string" ? email.trim() : "";
  const r = typeof role === "string" ? role.trim() : "";
  const q = typeof quote === "string" ? quote.trim() : "";

  if (!n) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!e || !EMAIL_RE.test(e)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (q.length < 20) return NextResponse.json({ error: "Please write at least a couple of sentences." }, { status: 400 });
  if (consent !== true) return NextResponse.json({ error: "Please confirm we may publish your testimonial." }, { status: 400 });
  if (n.length > 100) return NextResponse.json({ error: "Name too long (max 100 characters)." }, { status: 400 });
  if (e.length > 200) return NextResponse.json({ error: "Email too long (max 200 characters)." }, { status: 400 });
  if (r.length > 100) return NextResponse.json({ error: "Role too long (max 100 characters)." }, { status: 400 });
  if (q.length > 1200) return NextResponse.json({ error: "Testimonial too long (max 1200 characters)." }, { status: 400 });

  await prisma.testimonial.create({
    data: {
      authorName: n,
      authorRole: r || null,
      // Existing quotes are stored as HTML (rich text editor), so escape the plain text and wrap it.
      quote: `<p>${esc(q).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
      isActive: false,
      displayOrder: 100,
      submitterEmail: e,
      consentToPublish: true,
      source: "share-your-story",
    },
  });

  const settings = await prisma.platformSettings
    .findUnique({ where: { id: "singleton" }, select: { contactEmail: true } })
    .catch(() => null);
  const notifyTo = process.env.SUPER_ADMIN_EMAIL || settings?.contactEmail;
  if (notifyTo) {
    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
    sendMail({
      to: notifyTo,
      subject: `New testimonial from ${n}`,
      replyTo: e,
      text: `${n}${r ? ` (${r})` : ""} <${e}> sent a testimonial. It is NOT live until you switch it on.\n\n${q}\n\nReview: https://www.${platformDomain}/super-admin/settings`,
      html: `
        <p><strong>${esc(n)}</strong>${r ? ` (${esc(r)})` : ""} &lt;${esc(e)}&gt; sent a testimonial.</p>
        <p>It is <strong>not live</strong> until you switch it on in Super Admin &rarr; Settings &rarr; Testimonials.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
        <p style="white-space:pre-wrap">${esc(q)}</p>
      `,
    }).catch((err) => console.error("[marketing/testimonial] notify email failed:", err));
  }

  return NextResponse.json({ ok: true });
}
