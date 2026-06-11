import { prisma } from "@/lib/db";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Categories</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the shared categories used to organise Blog posts, Resources, and FAQs.
          Categories appear as dropdowns in the relevant editors and group content on the public pages.
        </p>
      </div>
      <CategoriesClient initial={categories} />
    </div>
  );
}
