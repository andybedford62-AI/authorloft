import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { LogoutButton } from "@/components/admin/logout-button";
import { prisma } from "@/lib/db";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const superAdminEmails = (process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (session?.user?.email ?? "").toLowerCase();

  if (!userEmail || !superAdminEmails.includes(userEmail)) {
    redirect("/");
  }

  const authorName   = (session!.user as any).name        || "Author";
  const authorSlug   = (session!.user as any).slug        || "author";
  const authorId     = (session!.user as any).id          as string;

  const [authorRecord, featureConfig] = await Promise.all([
    prisma.author.findUnique({
      where:  { id: authorId },
      select: { plan: { select: { tier: true } }, adminTheme: true },
    }),
    prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  const planTier     = authorRecord?.plan?.tier ?? "FREE";
  const featureGates = (featureConfig?.gates as Record<string, string>) ?? {};
  const adminTheme   = (authorRecord?.adminTheme === "dark" ? "dark" : "light") as "dark" | "light";

  const bg = {
    dark:  { outer: "#111827", header: "#1f2937", headerBorder: "#374151" },
    light: { outer: "#faf8f5", header: "#faf8f5", headerBorder: "#ddd6c8" },
  }[adminTheme];

  return (
    <AdminSessionProvider>
      <div
        data-admin-theme={adminTheme}
        className="flex min-h-screen"
        style={{ background: bg.outer }}
      >
        <AdminSidebar
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={true}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="h-16 border-b flex items-center px-6 flex-shrink-0"
            style={{ background: bg.header, borderColor: bg.headerBorder }}
          >
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{authorName}</span>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                {authorName[0]}
              </div>
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
