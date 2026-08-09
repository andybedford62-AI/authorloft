import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, wrapHtml } from "@/lib/mailer";

/**
 * GET /api/cron/social-promote-abuse-check
 * Runs hourly. Flags suspicious usage in the last 24h:
 *   - Authors whose gen count is >= 5x the per-author average AND above an absolute floor.
 *   - IPs that produced more than IP_THRESHOLD gens in 24h.
 * On any flag, sends one digest email to the admin alert list.
 */
const PER_AUTHOR_AVG_MULTIPLIER = 5;
const PER_AUTHOR_FLOOR          = 20;   // never flag below this many gens (noise filter)
const IP_THRESHOLD              = 100;  // gens per IP in 24h

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [perAuthor, perIp, settings] = await Promise.all([
    prisma.generatedSocialPost.groupBy({
      by: ["authorId"],
      where: { createdAt: { gte: since }, status: "SUCCESS" },
      _count: { _all: true },
    }),
    prisma.generatedSocialPost.groupBy({
      by: ["ipAddress"],
      where: { createdAt: { gte: since }, status: "SUCCESS", ipAddress: { not: null } },
      _count: { _all: true },
    }),
    prisma.socialPromoteSettings.findUnique({ where: { id: "main" } }),
  ]);

  const totalGens = perAuthor.reduce((s, r) => s + r._count._all, 0);
  const avgPerAuthor = perAuthor.length > 0 ? totalGens / perAuthor.length : 0;
  const authorThreshold = Math.max(PER_AUTHOR_FLOOR, Math.ceil(avgPerAuthor * PER_AUTHOR_AVG_MULTIPLIER));

  const flaggedAuthors = perAuthor.filter((r) => r._count._all >= authorThreshold);
  const flaggedIps     = perIp.filter((r) => r._count._all >= IP_THRESHOLD);

  if (flaggedAuthors.length === 0 && flaggedIps.length === 0) {
    return NextResponse.json({ ok: true, flagged: 0, totalGens, avgPerAuthor: Math.round(avgPerAuthor * 10) / 10 });
  }

  const recipients = resolveRecipients(settings?.adminAlertEmails ?? "");
  if (recipients.length === 0) {
    console.warn("[abuse-check] flagged but no recipients configured");
    return NextResponse.json({ ok: true, flaggedAuthors: flaggedAuthors.length, flaggedIps: flaggedIps.length, sent: false });
  }

  // Enrich flagged authors with names
  const authorIds = flaggedAuthors.map((f) => f.authorId);
  const authors = await prisma.author.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, displayName: true, email: true },
  });
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const authorRows = flaggedAuthors
    .sort((a, b) => b._count._all - a._count._all)
    .map((f) => {
      const a = authorMap.get(f.authorId);
      return `<tr><td style="padding:6px 12px;">${a?.displayName ?? a?.name ?? f.authorId}</td><td style="padding:6px 12px;">${a?.email ?? "—"}</td><td style="padding:6px 12px;font-weight:700;">${f._count._all}</td></tr>`;
    }).join("");

  const ipRows = flaggedIps
    .sort((a, b) => b._count._all - a._count._all)
    .map((f) => `<tr><td style="padding:6px 12px;font-family:monospace;">${f.ipAddress}</td><td style="padding:6px 12px;font-weight:700;">${f._count._all}</td></tr>`)
    .join("");

  const html = wrapHtml(
    "Social Promote — abuse check",
    `
    <p style="margin:0 0 14px;">The hourly Social Promote abuse check found unusual activity in the last 24 hours.</p>
    <p style="margin:0 0 14px;font-size:13px;color:#6b7280;">Total gens: <strong>${totalGens}</strong> · Authors active: <strong>${perAuthor.length}</strong> · Avg/author: <strong>${(Math.round(avgPerAuthor * 10) / 10)}</strong> · Author threshold: <strong>≥ ${authorThreshold}</strong></p>
    ${flaggedAuthors.length > 0 ? `
      <h3 style="margin:18px 0 8px;font-size:14px;">Authors over threshold (${flaggedAuthors.length})</h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse;">
        <thead><tr style="background:#f3f4f6;"><th style="text-align:left;padding:6px 12px;">Author</th><th style="text-align:left;padding:6px 12px;">Email</th><th style="text-align:left;padding:6px 12px;">Gens</th></tr></thead>
        <tbody>${authorRows}</tbody>
      </table>
    ` : ""}
    ${flaggedIps.length > 0 ? `
      <h3 style="margin:18px 0 8px;font-size:14px;">IPs over ${IP_THRESHOLD} gens (${flaggedIps.length})</h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-collapse:collapse;">
        <thead><tr style="background:#f3f4f6;"><th style="text-align:left;padding:6px 12px;">IP</th><th style="text-align:left;padding:6px 12px;">Gens</th></tr></thead>
        <tbody>${ipRows}</tbody>
      </table>
    ` : ""}
    <p style="margin:18px 0 0;font-size:13px;color:#6b7280;">Review the <a href="${baseUrl()}/super-admin/social-promote/log">Generation Log</a> for context. Nothing has been auto-disabled.</p>
    `,
  );

  await sendMail({
    to: recipients.join(", "),
    subject: `[Social Promote] Abuse check — ${flaggedAuthors.length} authors / ${flaggedIps.length} IPs flagged`,
    html,
    text: `Social Promote abuse check: ${flaggedAuthors.length} authors and ${flaggedIps.length} IPs flagged in the last 24h. See dashboard.`,
  });

  return NextResponse.json({
    ok: true,
    flaggedAuthors: flaggedAuthors.length,
    flaggedIps:     flaggedIps.length,
    authorThreshold,
    sent:           true,
  });
}

function resolveRecipients(dbField: string): string[] {
  const fromDb = dbField.split(",").map((s) => s.trim()).filter(Boolean);
  if (fromDb.length > 0) return fromDb;
  return (process.env.SOCIAL_PROMOTE_ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
}
