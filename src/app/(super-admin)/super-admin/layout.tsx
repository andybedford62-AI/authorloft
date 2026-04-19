import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <span className="font-semibold text-white">AuthorLoft Super Admin</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/super-admin" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/super-admin/plans" className="text-gray-400 hover:text-white transition-colors">Plans</Link>
            <Link href="/super-admin/authors" className="text-gray-400 hover:text-white transition-colors">Authors</Link>
            <Link href="/admin/genres" className="text-gray-400 hover:text-white transition-colors">Genres</Link>
            <Link href="/super-admin/legal" className="text-gray-400 hover:text-white transition-colors">Legal</Link>
          </nav>
          <div className="ml-auto text-xs text-gray-500">
            Signed in as <span className="text-purple-400">{session?.user?.email}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}