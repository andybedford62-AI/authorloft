import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageForm } from "@/components/admin/page-form";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const page = await prisma.authorPage.findFirst({
    where: { id, authorId },
  });

  if (!page) notFound();

  const initial = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    navTitle: page.navTitle ?? "",
    content: page.content ?? "",
    isPublished: page.isVisible,
    showInNav: page.showInNav,
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update &ldquo;{page.title}&rdquo;
        </p>
      </div>

      <PageForm initial={initial} />
    </div>
  );
}
