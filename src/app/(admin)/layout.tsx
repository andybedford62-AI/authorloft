import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { ToastProvider } from "@/components/toast-provider";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { RenewalReminderBanner } from "@/components/admin/renewal-reminder-banner";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sessionAuthorId = (session.user as any).id as string;
  const isSuperAdmin    = (session.user as any).isSuperAdmin || false;

  // Check for active impersonation (super admins only)
  const cookieStore = await cookies();
  const impersonateCookie = cookieStore.get("al_impersonate");
  const impersonatedId = isSuperAdmin && impersonateCookie?.value
    ? impersonateCookie.value
    : null;

  const effectiveAuthorId = impersonatedId ?? sessionAuthorId;

  // Fetch the effective author's data (impersonated or own)
  const [authorRecord, featureConfig, subscription] = await Promise.all([
    prisma.author.findUnique({
      where:  { id: effectiveAuthorId },
      select: {
        name:             true,
        displayName:      true,
        slug:             true,
        adminTheme:       true,
        termsAcceptedAt:  true,
        plan:             { select: { tier: true } },
      },
    }),
    prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } }),
    prisma.authorSubscription.findUnique({
      where:  { authorId: effectiveAuthorId },
      select: { currentPeriodEnd: true },
    }),
  ]);

  if (!authorRecord) redirect("/login");

  // Gate: new users must accept T&C before accessing any admin page.
  // Impersonated sessions are exempt (super admin already accepted).
  if (!impersonatedId && !authorRecord.termsAcceptedAt) {
    redirect("/accept-terms");
  }

  const authorName   = authorRecord.displayName || authorRecord.name;
  const authorSlug   = authorRecord.slug;
  const planTier     = authorRecord.plan?.tier ?? "FREE";
  const featureGates = (featureConfig?.gates as Record<string, string>) ?? {};
  const adminTheme   = (authorRecord.adminTheme === "dark" ? "dark" : "light") as "dark" | "light";

  const bg = {
    dark:  { outer: "#111827", header: "#1f2937", headerBorder: "#374151" },
    light: { outer: "#faf8f5", header: "#faf8f5", headerBorder: "#ddd6c8" },
  }[adminTheme];

  return (
    <AdminSessionProvider>
      <ToastProvider />
      <div
        data-admin-theme={adminTheme}
        className="flex min-h-screen flex-col"
        style={{ background: bg.outer }}
      >
        {/* Impersonation banner — shown when super admin is acting as another author */}
        {impersonatedId && <ImpersonationBanner authorName={authorName} />}

        {/* Renewal reminder — shown to the author (not during impersonation) */}
        {!impersonatedId && subscription?.currentPeriodEnd && (
          <RenewalReminderBanner currentPeriodEnd={subscription.currentPeriodEnd} />
        )}

        <AdminShell
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={isSuperAdmin}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
          bg={{ header: bg.header, headerBorder: bg.headerBorder }}
        >
          {children}
        </AdminShell>
      </div>
    </AdminSessionProvider>
  );
}
