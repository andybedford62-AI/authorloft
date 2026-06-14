export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const isSuperAdmin = (session.user as any).isSuperAdmin;
  if (!isSuperAdmin) redirect("/admin/dashboard");

  const authorName = (session.user as any).name  || "Admin";
  const authorSlug = (session.user as any).slug  || "admin";
  const authorId   = (session.user as any).id    as string;

  const [authorRecord, featureConfig] = await Promise.all([
    prisma.author.findUnique({
      where:  { id: authorId },
      select: { plan: { select: { tier: true } }, adminTheme: true, termsAcceptedAt: true },
    }),
    prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  if (authorRecord && !authorRecord.termsAcceptedAt) {
    redirect("/accept-terms");
  }

  const planTier    = authorRecord?.plan?.tier ?? "FREE";
  const featureGates = (featureConfig?.gates as Record<string, string>) ?? {};
  const adminTheme  = (authorRecord?.adminTheme === "dark" ? "dark" : "light") as "dark" | "light";

  const bg = {
    dark:  { outer: "#111827", header: "#1f2937", headerBorder: "#374151" },
    light: { outer: "#faf8f5", header: "#faf8f5", headerBorder: "#ddd6c8" },
  }[adminTheme];

  return (
    <AdminSessionProvider>
      <div
        data-admin-theme={adminTheme}
        className="flex min-h-screen flex-col"
        style={{ background: bg.outer }}
      >
        {/* Reuse the author AdminShell so super-admin inherits the same
            mobile drawer + hamburger + responsive header. */}
        <AdminShell
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={true}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
          bg={{ header: bg.header, headerBorder: bg.headerBorder }}
          headerBadge={
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Super Admin
            </span>
          }
        >
          {children}
        </AdminShell>
      </div>
    </AdminSessionProvider>
  );
}
