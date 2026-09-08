import { Ban } from "lucide-react";

// Very visible, unmissable-on-purpose: authors must not be able to reach the
// list/track editor without seeing this. Music playlists/albums are link-out
// only — there is no price field anywhere in this flow, and it must stay that
// way (hosting/selling music opens copyright and licensing liability the
// link-only model avoids). See docs/CHANGELOG.md 2026-09-08.
export function MusicNoSalesBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-red-50 border-2 border-red-300 px-4 py-3.5 text-sm text-red-900">
      <Ban className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
      <span>
        <strong>Playlists &amp; albums are link-only.</strong> Each track points out to where it
        already lives (Spotify, YouTube, Suno, etc.) — AuthorLoft does not host, stream, or sell
        music. <strong>There is no way to charge for a playlist or album on this site.</strong>
      </span>
    </div>
  );
}
