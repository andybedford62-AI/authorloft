import { Music2 } from "lucide-react";
import { type BookstoreMusic, BookstoreMusicCard } from "@/components/marketing/bookstore-music-card";

// No filter facet here (unlike Books/Courses) — music lists have no genre or
// category taxonomy of their own, see getBookstoreMusic() in @/lib/bookstore.
export function BookstoreMusicGrid({ music }: { music: BookstoreMusic[] }) {
  if (music.length === 0) {
    return (
      <div className="text-center py-16 bg-vault-surf rounded-2xl border border-vault-ink/12">
        <Music2 className="h-10 w-10 text-vault-mute mx-auto mb-3" />
        <p className="text-vault-mute">No music listed yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {music.map((m) => (
        <BookstoreMusicCard key={m.id} music={m} />
      ))}
    </div>
  );
}
