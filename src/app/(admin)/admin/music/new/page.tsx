import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { MusicListForm } from "@/components/admin/music-list-form";

export const dynamic = "force-dynamic";

export default async function NewMusicListPage() {
  const authorId = await getAdminAuthorId();
  const trackCap = await maxTracksPerList(authorId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/music" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Music
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Music List / Album</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add tracks by pasting public links. Nothing is uploaded or stored here.
        </p>
      </div>
      <MusicListForm trackCap={trackCap} />
    </div>
  );
}
