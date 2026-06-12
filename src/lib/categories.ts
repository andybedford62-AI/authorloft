import { prisma } from "@/lib/db";

export type CategoryType = "blog" | "resource" | "faq" | "news";

/** Active categories of a given type, ordered for display (sortOrder then name). */
export async function getCategories(type: CategoryType) {
  return prisma.category
    .findMany({
      where: { type, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
    .catch(() => []);
}

/** Just the display names of active categories of a given type. */
export async function getCategoryNames(type: CategoryType): Promise<string[]> {
  const cats = await getCategories(type);
  return cats.map((c) => c.name);
}
