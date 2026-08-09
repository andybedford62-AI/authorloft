import { prisma } from "@/lib/db";
import { sendMail, wrapHtml } from "@/lib/mailer";

/**
 * Checks today's spend vs the configured cost ceilings AFTER a successful generation.
 * - If today crossed costWarnCentsPerDay (and didn't yet before this gen) → warn email
 * - If today crossed costDisableCentsPerDay → flip settings.enabled = false + disable email
 *
 * Stateless: relies on "did we just cross" math to avoid alert spam. Safe to call after every gen.
 * Best-effort: failures logged but never propagated to the caller (the gen itself already succeeded).
 */
export async function checkCostCeilingsAfterGen(opts: {
  thisGenCostMicroCents: number;
}): Promise<void> {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const [settings, todaySpend] = await Promise.all([
      prisma.socialPromoteSettings.findUnique({ where: { id: "main" } }),
      prisma.generatedSocialPost.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum:  { costMicroCents: true },
      }),
    ]);

    if (!settings) return;

    const todayMicroCents   = todaySpend._sum.costMicroCents ?? 0;
    const prevMicroCents    = todayMicroCents - opts.thisGenCostMicroCents;
    const warnMicroCents    = settings.costWarnMicroCentsPerDay;
    const disableMicroCents = settings.costDisableMicroCentsPerDay;

    const justCrossedWarn    = prevMicroCents < warnMicroCents    && todayMicroCents >= warnMicroCents    && warnMicroCents > 0;
    const justCrossedDisable = prevMicroCents < disableMicroCents && todayMicroCents >= disableMicroCents && disableMicroCents > 0;

    const recipients = resolveRecipients(settings.adminAlertEmails);
    if (recipients.length === 0) {
      if (justCrossedDisable) {
        // Still flip the kill switch even if no email goes out
        await prisma.socialPromoteSettings.update({ where: { id: "main" }, data: { enabled: false } });
      }
      return;
    }

    if (justCrossedDisable) {
      await prisma.socialPromoteSettings.update({ where: { id: "main" }, data: { enabled: false } });
      await sendDisableEmail(recipients, todayMicroCents, disableMicroCents);
    } else if (justCrossedWarn) {
      await sendWarnEmail(recipients, todayMicroCents, warnMicroCents, disableMicroCents);
    }
  } catch (err) {
    console.error("[social-promote/cost-alerts] check failed:", err);
  }
}

function resolveRecipients(dbField: string): string[] {
  const fromDb  = dbField.split(",").map((s) => s.trim()).filter(Boolean);
  if (fromDb.length > 0) return fromDb;
  const fromEnv = (process.env.SOCIAL_PROMOTE_ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return fromEnv;
}

function fmtUsd(microCents: number): string {
  const usd = microCents / 1_000_000;
  // Show 4 decimal places for tiny amounts (testing), 2 for normal amounts.
  const decimals = usd < 1 ? 4 : 2;
  return `$${usd.toFixed(decimals)}`;
}

async function sendWarnEmail(recipients: string[], todayMicroCents: number, warnMicroCents: number, disableMicroCents: number) {
  const to = recipients.join(", ");
  const html = wrapHtml(
    "Social Promote — cost warning",
    `
    <p style="margin:0 0 14px;">Today's Social Promote AI spend just crossed the <strong>warn ceiling</strong>.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;font-size:14px;">
      <tr><td style="padding:6px 12px;background:#fef3c7;border-radius:4px 0 0 4px;">Spend so far today</td><td style="padding:6px 12px;background:#fef3c7;border-radius:0 4px 4px 0;font-weight:700;">${fmtUsd(todayMicroCents)}</td></tr>
      <tr><td style="padding:6px 12px;">Warn ceiling</td><td style="padding:6px 12px;">${fmtUsd(warnMicroCents)}</td></tr>
      <tr><td style="padding:6px 12px;">Auto-disable ceiling</td><td style="padding:6px 12px;">${fmtUsd(disableMicroCents)}</td></tr>
    </table>
    <p style="margin:0 0 14px;">Generations are still flowing — nothing has been disabled. If spend reaches the auto-disable ceiling we'll flip the kill switch and email again.</p>
    <p style="margin:0;font-size:13px;color:#6b7280;">Check the Generation Log for unusual patterns: <a href="${baseUrl()}/super-admin/social-promote/log">Generation Log</a></p>
    `,
  );
  await sendMail({ to, subject: `[Social Promote] Cost warning — ${fmtUsd(todayMicroCents)} today`, html, text: `Social Promote spend today: ${fmtUsd(todayMicroCents)} (warn ceiling: ${fmtUsd(warnMicroCents)}, auto-disable: ${fmtUsd(disableMicroCents)})` });
}

async function sendDisableEmail(recipients: string[], todayMicroCents: number, disableMicroCents: number) {
  const to = recipients.join(", ");
  const html = wrapHtml(
    "Social Promote — AUTO-DISABLED",
    `
    <p style="margin:0 0 14px;font-size:16px;"><strong>Social Promote has been auto-disabled.</strong></p>
    <p style="margin:0 0 14px;">Today's AI spend reached the auto-disable ceiling. The kill switch is now flipped <strong>off</strong> and authors will see a "temporarily unavailable" message until it's manually re-enabled.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;font-size:14px;">
      <tr><td style="padding:6px 12px;background:#fee2e2;border-radius:4px 0 0 4px;">Spend today</td><td style="padding:6px 12px;background:#fee2e2;border-radius:0 4px 4px 0;font-weight:700;">${fmtUsd(todayMicroCents)}</td></tr>
      <tr><td style="padding:6px 12px;">Auto-disable ceiling</td><td style="padding:6px 12px;">${fmtUsd(disableMicroCents)}</td></tr>
    </table>
    <p style="margin:0 0 14px;">Investigate before re-enabling. The Generation Log will show what drove the spend.</p>
    <p style="margin:0;font-size:13px;color:#6b7280;">
      <a href="${baseUrl()}/super-admin/social-promote/log">Generation Log</a> · <a href="${baseUrl()}/super-admin/social-promote/settings">Settings (re-enable here)</a>
    </p>
    `,
  );
  await sendMail({ to, subject: `[Social Promote] AUTO-DISABLED — ${fmtUsd(todayMicroCents)} reached`, html, text: `Social Promote auto-disabled. Today's spend ${fmtUsd(todayMicroCents)} reached the ${fmtUsd(disableMicroCents)} ceiling. Re-enable at /super-admin/social-promote/settings after investigating.` });
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
}
