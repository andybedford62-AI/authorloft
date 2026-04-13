import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { PageForm } from "@/components/admin/page-form";

export default async function NewPagePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Pages & Navigation
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Page</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a custom page for your author site.
        </p>
      </div>

      <PageForm />
    </div>
  );
}
