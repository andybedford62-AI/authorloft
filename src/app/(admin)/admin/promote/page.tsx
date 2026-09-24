import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { loadAuthorPromoteContext } from "@/lib/social-promote/author-context";
import { PromotePanel, type PromotePreselect } from "@/components/admin/promote/promote-panel";

export const dynamic = "force-dynamic";

export default async function AuthorPromotePage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string; course?: string; music?: string }>;
}) {
  const { book, course, music } = await searchParams;
  const preselect: PromotePreselect =
    book ? { type: "book", id: book } : course ? { type: "course", id: course } : music ? { type: "music", id: music } : null;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = await getAdminAuthorId();
  const ctx      = await loadAuthorPromoteContext(authorId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promote</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate ready-to-paste social posts about your books, courses, music and writing — built on your data, in your voice.
        </p>
      </div>

      <PromotePanel context={ctx} preselect={preselect} />
    </div>
  );
}
