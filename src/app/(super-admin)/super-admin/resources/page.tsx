import { prisma } from "@/lib/db";
import { getCategoryNames } from "@/lib/categories";
import { ResourcesClient } from "./resources-client";

export default async function ResourcesPage() {
  const [resources, categoryOptions] = await Promise.all([
    prisma.platformResource.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
    getCategoryNames("resource"),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources Directory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the curated tools and communities shown on the public /resources page and homepage strip.
        </p>
      </div>
      <ResourcesClient initial={resources} categoryOptions={[...categoryOptions].sort((a, b) => a.localeCompare(b))} />
    </div>
  );
}
