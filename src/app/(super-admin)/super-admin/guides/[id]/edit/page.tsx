import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { GuideForm } from "@/components/super-admin/guide-form";
import { getCategoryNames } from "@/lib/categories";

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [guide, categoryOptions] = await Promise.all([
    prisma.guide.findUnique({ where: { id } }),
    getCategoryNames("guide").catch(() => [] as string[]),
  ]);
  if (!guide) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Guide — {guide.title}</h1>
        <p className="text-sm text-gray-500 mt-1">Changes are saved immediately. Published guides appear at /guides/{guide.slug}.</p>
      </div>
      <GuideForm guide={guide as any} categoryOptions={[...categoryOptions].sort((a, b) => a.localeCompare(b))} />
    </div>
  );
}
