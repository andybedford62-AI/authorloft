import { prisma } from "@/lib/db";
import { ResourcesClient } from "./resources-client";

export default async function ResourcesPage() {
  const resources = await prisma.platformResource.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources Directory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the curated tools and communities shown on the public /resources page and homepage strip.
        </p>
      </div>
      <ResourcesClient initial={resources} />
    </div>
  );
}
