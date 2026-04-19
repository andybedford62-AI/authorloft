import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { LogoutButton } from "@/components/admin/logout-button";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) redirect("/login");

  const authorName   = (session.user as any).name        || "Author";
  const authorSlug   = (session.user as any).slug        || "author";
  const isSuperAdmin = (session.user as any).isSuperAdmin || false;
  const authorId     = (session.user as any).id          as string;

  // Fetch plan tier, feature gates, and admin theme preference
  const [authorRecord, featureConfig] = await Promise.all([
    prisma.author.findUnique({
      where:  { id: authorId },
      select: { plan: { select: { tier: true } }, adminTheme: true },
    }),
    prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } }),
  ]);
  const planTier    = authorRecord?.plan?.tier ?? "FREE";
  const featureGates = (featureConfig?.gates as Record<string, string>) ?? {};
  const adminTheme  = (authorRecord?.adminTheme === "light" ? "light" : "dark") as "dark" | "light";

  return (
    <AdminSessionProvider>
      <div
        className="flex min-h-screen"
        style={{ background: adminTheme === "light" ? "#faf8f5" : "#f9fafb" }}
      >
        <AdminSidebar
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={isSuperAdmin}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="h-16 border-b flex items-center px-6 flex-shrink-0"
            style={{
              background:   adminTheme === "light" ? "#faf8f5" : "#ffffff",
              borderColor:  adminTheme === "light" ? "#ddd6c8" : "#e5e7eb",
            }}
          >
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{authorName}</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
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
