import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { BundleForm } from "@/components/admin/bundle-form";

export default async function NewBundlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/bundles"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Bundles
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">New Bundle</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Bundle</h1>
        <p className="text-sm text-gray-500 mt-1">
          Package multiple book formats together at a discounted price.
        </p>
      </div>

      <BundleForm mode="create" />
    </div>
  );
}
