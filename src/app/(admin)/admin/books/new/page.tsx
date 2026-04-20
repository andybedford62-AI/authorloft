import { prisma } from "@/lib/db";
import { BookForm } from "@/components/admin/book-form";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function NewBookPage() {
  const authorId = await getAdminAuthorId();

  const [seriesList, genreTree] = await Promise.all([
    prisma.series.findMany({
      where: { authorId },
      orderBy: { name: "asc" },
    }),
    prisma.genre.findMany({
      where: { authorId, parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Flatten genre tree into a labeled list for the form
  const genres = genreTree.flatMap((g) => [
    { id: g.id, name: g.name, parentName: undefined },
    ...g.children.map((c) => ({ id: c.id, name: c.name, parentName: g.name })),
  ]);

  const series = seriesList.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Book</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new title to your catalog.</p>
      </div>

      {/* Workflow hint */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        <p className="font-medium mb-1">Two-step process</p>
        <p className="text-blue-600">
          Fill in the details below and click <strong>Create Book</strong>. You'll then land on
          the full edit page where you can add <strong>Direct Sales</strong> formats with pricing
          and <strong>Buy Links</strong> for retailers like Amazon.
        </p>
      </div>

      <BookForm mode="new" series={series} genres={genres} />
    </div>
  );
}
