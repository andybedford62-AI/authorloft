import { GuideForm } from "@/components/super-admin/guide-form";
import { getCategoryNames } from "@/lib/categories";

export default async function NewGuidePage() {
  const categoryOptions = await getCategoryNames("guide").catch(() => [] as string[]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Guide</h1>
        <p className="text-sm text-gray-500 mt-1">Create an evergreen pillar page. Use the FAQ section for structured FAQ schema and the Related Posts to link supporting blog articles.</p>
      </div>
      <GuideForm categoryOptions={[...categoryOptions].sort((a, b) => a.localeCompare(b))} />
    </div>
  );
}
