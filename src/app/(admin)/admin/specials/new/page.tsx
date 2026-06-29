import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { SpecialForm } from "@/components/admin/special-form";

export default async function NewSpecialPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/specials"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Specials
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">New Special</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Special</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a promotion, deal, or exclusive offer for your readers.
        </p>
      </div>

      <SpecialForm mode="create" />
    </div>
  );
}
