import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  // Only super admins may access these pages
  const isSuperAdmin = (session.user as any).isSuperAdmin;
  if (!isSuperAdmin) redirect("/admin/dashboard");

  const authorName = (session.user as any).name || "Admin";
  const authorSlug = (session.user as any).slug || "admin";

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={true}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Super Admin
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{authorName}</span>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                {authorName[0]}
              </div>
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
