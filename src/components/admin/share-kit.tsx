"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, EyeOff, Share2, ChevronDown, Sparkles } from "lucide-react";
import { BookQRCode } from "@/components/admin/book-qr-code";
import { shareIntentUrl, taggedUrl } from "@/lib/share";

// Everything an author needs to push a book, course or music list out, in one
// card on its editor: the live URL, one-click post buttons, per-network tagged
// links (so Traffic Sources shows which network sent the visitors), a ready
// caption, a QR code and a jump into Social Promote. TikTok and Instagram have
// no web share intent, so they get a copyable bio link instead of a post button.

export type ShareKind = "book" | "course" | "music";

const TAGGED: { source: string; label: string; hint: string }[] = [
  { source: "instagram", label: "Instagram", hint: "Bio link or Story link sticker" },
  { source: "tiktok",    label: "TikTok",    hint: "Bio link or video caption" },
  { source: "facebook",  label: "Facebook",  hint: "Post or Page button" },
  { source: "x",         label: "X",         hint: "Post or profile link" },
  { source: "youtube",   label: "YouTube",   hint: "Video description" },
  { source: "newsletter", label: "Newsletter / email", hint: "Email campaigns" },
];

const AUDIENCE: Record<ShareKind, string> = { book: "readers", course: "students", music: "listeners" };

const QR_BLURB: Record<ShareKind, string> = {
  book:   "Put it on bookmarks, signing tables or the back of your business card.",
  course: "Put it on slides, workshop handouts or business cards.",
  music:  "Put it on gig posters, merch tables or CD sleeves.",
};

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function captionFor(kind: ShareKind, noun: string, title: string, link: string): string {
  if (kind === "book")   return `📚 My book "${title}" is out now. Find out more and grab your copy here: ${link}`;
  if (kind === "course") return `🎓 My course "${title}" is open. See what's inside: ${link}`;
  return noun === "playlist"
    ? `🎧 New playlist: "${title}" — have a listen and tell me your favourite track. ${link}`
    : `🎶 My ${noun} "${title}" is out now — listen here: ${link}`;
}

function postTextFor(kind: ShareKind, title: string, creatorName: string): string {
  if (kind === "music")  return `Listen to "${title}" by ${creatorName}`;
  if (kind === "course") return `Check out "${title}", a course by ${creatorName}`;
  return `Check out "${title}" by ${creatorName}`;
}

export function ShareKit({
  kind,
  itemId,
  url,
  slug,
  title,
  creatorName,
  noun = kind,
  isPublished,
  className = "",
  bare = false,
}: {
  kind: ShareKind;
  itemId: string;
  /** Clean public URL — tags are added per network. */
  url: string;
  slug: string;
  title: string;
  creatorName: string;
  /** What the item is called in copy: "book", "course", or a music release label ("album", "ep"…). */
  noun?: string;
  isPublished: boolean;
  className?: string;
  /** Content only — for use inside a CollapsibleCard that supplies the card and title. */
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const caption = captionFor(kind, noun, title, taggedUrl(url, "caption", slug));
  const postText = postTextFor(kind, title, creatorName);
  const shownNoun = noun === "ep" ? "EP" : noun;

  return (
    <div className={bare ? `space-y-4 ${className}` : `bg-white rounded-xl border border-gray-200 p-6 space-y-4 ${className}`}>
      {!bare && (
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Share this {shownNoun}</h2>
        </div>
      )}

      {!isPublished && (
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
          <EyeOff className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>
            This is still a draft, so the link below won&apos;t work for {AUDIENCE[kind]} yet. Publish it first, then share.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-700"
        />
        <div className="flex items-center gap-2">
          <CopyButton value={url} label="Copy link" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View live
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Post now:</span>
        {(["facebook", "x", "threads", "linkedin"] as const).map((n) => (
          <a
            key={n}
            href={shareIntentUrl(n, taggedUrl(url, n, slug), postText)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full border border-gray-200 text-xs text-gray-700 hover:bg-gray-50"
          >
            {n === "x" ? "X" : n[0].toUpperCase() + n.slice(1)}
          </a>
        ))}
        {isPublished && (
          <Link
            href={`/admin/promote?${kind}=${itemId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50 text-xs font-medium text-purple-700 hover:bg-purple-100"
          >
            <Sparkles className="h-3 w-3" /> Write a post with AI
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        aria-expanded={open}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? "Hide" : "More sharing tools"}: tracked links, caption, QR code
      </button>

      {open && (
        <div className="space-y-5 pt-1">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-1">Tracked links</h3>
            <p className="text-xs text-gray-400 mb-3">
              Same page, tagged per network, so your Traffic Sources show where {AUDIENCE[kind]} came from.
              {kind === "music" && (
                <> Each track also has a <strong>Share</strong> button on the public page for song-specific links.</>
              )}
            </p>
            <div className="space-y-2">
              {TAGGED.map((t) => {
                const link = taggedUrl(url, t.source, slug);
                return (
                  <div key={t.source} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <p className="text-sm text-gray-800">{t.label}</p>
                      <p className="text-[11px] text-gray-400">{t.hint}</p>
                    </div>
                    <p className="flex-1 min-w-0 truncate text-xs font-mono text-gray-500">{link}</p>
                    <CopyButton value={link} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-1">Suggested caption</h3>
            <div className="flex items-start gap-2">
              <p className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 break-words">
                {caption}
              </p>
              <CopyButton value={caption} />
            </div>
          </div>

          <BookQRCode
            bookUrl={taggedUrl(url, "qr", slug, "offline")}
            bookTitle={title}
            blurb={`${QR_BLURB[kind]} Scans straight to this ${shownNoun}.`}
          />
        </div>
      )}
    </div>
  );
}
