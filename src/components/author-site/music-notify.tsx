import { NewsletterInlineForm } from "@/components/author-site/newsletter-inline-form";

// "Tell me when new music is out" box for the public Music pages. Subscribes to
// the author's one newsletter list with the "music" interest tag added (merge
// mode, so an existing subscriber keeps their other interests).
export function MusicNotify({ authorId, accentColor, artistName }: { authorId: string; accentColor: string; artistName: string }) {
  return (
    <section className="max-w-xl mx-auto text-center space-y-3 rounded-2xl border border-gray-200 bg-white px-6 py-8">
      <h2 className="text-lg font-semibold text-gray-900">Get new releases</h2>
      <p className="text-sm text-gray-500">
        Be the first to hear when {artistName} publishes a new song, album or playlist.
      </p>
      <NewsletterInlineForm
        authorId={authorId}
        accentColor={accentColor}
        mergeInterests={["music"]}
        buttonLabel="Notify me →"
      />
    </section>
  );
}
