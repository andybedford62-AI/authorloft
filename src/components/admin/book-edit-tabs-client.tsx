"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, Circle, Copy, Check, Rocket } from "lucide-react";
import { BookForm } from "@/components/admin/book-form";
import { RetailerLinks } from "@/components/admin/retailer-links";
import { DirectSalesItems } from "@/components/admin/direct-sales-items";
import { BookAudioTracks } from "@/components/admin/book-audio-tracks";
import { BookPreviewMedia } from "@/components/admin/book-preview-media";
import { BookReviews } from "@/components/admin/book-reviews";
import { BookExcerptEditor } from "@/components/admin/book-excerpt-editor";
import { ArcTab } from "@/components/admin/books/arc-tab";
import { PreOrderSignups } from "@/components/admin/preorder-signups";
import { AffiliateSettings } from "@/components/admin/affiliate-settings";
import { BookQRCode } from "@/components/admin/book-qr-code";
import { BookAutoFormatter } from "@/components/admin/book-auto-formatter";
type Series = { id: string; name: string };
type Genre  = { id: string; name: string; parentName?: string };

type PreviewMedia = {
  id: string;
  position: number;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO";
  fileUrl: string;
  fileKey: string | null;
  thumbnailUrl: string | null;
  thumbnailFileKey: string | null;
};

type BookData = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  priceCents: number;
  seriesId: string | null;
  isbn: string | null;
  pageCount: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  directSalesEnabled: boolean;
  listInBookstore: boolean;
  isPreOrder: boolean;
  preOrderDate: string | null;
  autoSendLaunchEmail: boolean;
  showCountdown: boolean;
  launchDate: string | null;
  genreIds: string[];
  availableFormats: string[];
  caption: string | null;
  releaseDate: string | null;
  sampleContent: string | null;
};

type Props = {
  book: BookData;
  series: Series[];
  genres: Genre[];
  audioEnabled: boolean;
  salesEnabled: boolean;
  planTier: "FREE" | "STANDARD" | "PREMIUM";
  bookstoreEnabled: boolean;
  preOrdersEnabled: boolean;
  arcEnabled: boolean;
  stripeConnectOnboarded: boolean;
  previewMedia: PreviewMedia[];
  publicBaseUrl: string;
};

type TabId = "details" | "organisation" | "buy-links" | "direct-sales" | "affiliate" | "media" | "format" | "reviews" | "excerpt" | "arcs";

const TABS: { id: TabId; label: string }[] = [
  { id: "details",       label: "Details" },
  { id: "organisation",  label: "Organisation" },
  { id: "buy-links",     label: "Buy Links" },
  { id: "direct-sales",  label: "Direct Sales" },
  { id: "affiliate",     label: "Affiliate" },
  { id: "media",         label: "Media" },
  { id: "format",        label: "ePub Format" },
  { id: "reviews",       label: "Reviews" },
  { id: "excerpt",       label: "Excerpt" },
  { id: "arcs",          label: "ARC" },
];

export function BookEditTabsClient({ book, series, genres, audioEnabled, salesEnabled, planTier, bookstoreEnabled, preOrdersEnabled, arcEnabled, stripeConnectOnboarded, previewMedia, publicBaseUrl }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = searchParams.get("tab") as TabId | null;
    return tab && TABS.some((t) => t.id === tab) ? tab : "details";
  });

  return (
    <div className="space-y-0">
      {/* ── Tab bar ── */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
              {id === "direct-sales" && !salesEnabled && (
                <Lock className="h-3 w-3 text-amber-400" />
              )}
              {id === "affiliate" && !salesEnabled && (
                <Lock className="h-3 w-3 text-amber-400" />
              )}
              {id === "arcs" && !arcEnabled && (
                <Lock className="h-3 w-3 text-amber-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── BookForm — always mounted; internally shows Details or Organisation sections.
               Hidden (CSS) when a non-form tab is active so state is preserved. ── */}
      <BookForm
        mode="edit"
        book={book}
        series={series}
        genres={genres}
        activeTab={activeTab}
        salesEnabled={salesEnabled}
        bookstoreEnabled={bookstoreEnabled}
        preOrdersEnabled={preOrdersEnabled}
      />

      {/* ── Pre-order signups — shown below Organisation when "Coming Soon" is enabled ── */}
      {activeTab === "organisation" && book.isPreOrder && (
        <div className="max-w-3xl mt-6">
          <PreOrderSignups bookId={book.id} />
        </div>
      )}

      {/* ── Launch Toolkit — shown on Organisation tab ── */}
      {activeTab === "organisation" && (
        <LaunchToolkit book={book} publicBaseUrl={publicBaseUrl} />
      )}

      {/* ── QR Code — shown on Details tab so authors can grab it without hunting ── */}
      {activeTab === "details" && (
        <div className="max-w-3xl mt-6">
          <BookQRCode
            bookUrl={`${publicBaseUrl}/books/${book.slug}`}
            bookTitle={book.title}
          />
        </div>
      )}

      {/* ── Standalone tab panels — mounted only when active ── */}
      {activeTab === "buy-links" && (
        <div className="max-w-3xl space-y-4">
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
            <strong>Buy Links</strong> — Add links to your book on Amazon, Apple Books, Kobo, and other retailers. Readers click through to purchase on those platforms. You don't receive payment here — the retailer does.
          </div>
          <RetailerLinks bookId={book.id} />
        </div>
      )}

      {activeTab === "direct-sales" && (
        <div className="max-w-3xl space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
            <strong>Direct Sales</strong> — Sell your eBook, PDF, or audio file directly from your AuthorLoft site. You set the price, readers pay and download instantly, and the money goes straight to you via Stripe.
          </div>
          <DirectSalesItems bookId={book.id} salesEnabled={salesEnabled} planTier={planTier} stripeConnectOnboarded={stripeConnectOnboarded} />
        </div>
      )}

      {activeTab === "affiliate" && (
        <div className="max-w-3xl">
          <AffiliateSettings bookId={book.id} bookSlug={book.slug} publicBaseUrl={publicBaseUrl} salesEnabled={salesEnabled} />
        </div>
      )}

      {activeTab === "media" && (
        <div className="max-w-3xl space-y-6">
          <BookPreviewMedia bookId={book.id} initial={previewMedia} />
          <BookAudioTracks bookId={book.id} audioEnabled={audioEnabled} />
        </div>
      )}

      {activeTab === "format" && (
        <div className="max-w-3xl">
          <BookAutoFormatter bookId={book.id} />
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="max-w-3xl">
          <BookReviews bookId={book.id} />
        </div>
      )}

      {activeTab === "excerpt" && (
        <div className="max-w-3xl">
          <BookExcerptEditor bookId={book.id} initial={book.sampleContent} />
        </div>
      )}

      {activeTab === "arcs" && (
        <div className="max-w-3xl">
          {arcEnabled ? (
            <ArcTab bookId={book.id} bookTitle={book.title} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Lock className="h-8 w-8 text-amber-400" />
              <p className="font-semibold text-gray-800">Standard plan required</p>
              <p className="text-sm text-gray-500 max-w-sm">
                ARC management is available on the Standard and Premium plans.
                Upgrade to send advance reader copies and track reviews.
              </p>
              <a
                href="/admin/settings#billing"
                className="mt-2 inline-block px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Upgrade Plan
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LaunchToolkit({ book, publicBaseUrl }: { book: BookData; publicBaseUrl: string }) {
  const [copied, setCopied] = useState(false);

  const bookUrl  = `${publicBaseUrl}/books/${book.slug}`;
  const copyText = `🚀 My new book "${book.title}" is live — check it out! ${bookUrl}`;

  const checklist = [
    { label: "Cover image uploaded",         done: !!book.coverImageUrl },
    { label: "Description added",            done: !!book.description },
    { label: "Genre assigned",               done: book.genreIds.length > 0 },
    { label: "Direct sales or buy links set",done: book.directSalesEnabled },
    { label: "Published or pre-order active",done: book.isPublished || book.isPreOrder },
  ];

  const allDone    = checklist.every((c) => c.done);
  const doneCnt    = checklist.filter((c) => c.done).length;

  function handleCopy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-3xl mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 text-rose-500" />
        <h3 className="font-semibold text-gray-900 text-sm">Launch Toolkit</h3>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
          allDone ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-700"
        }`}>
          {doneCnt}/{checklist.length} ready
        </span>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checklist.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm">
            {done
              ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              : <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
            }
            <span className={done ? "text-gray-700" : "text-gray-400"}>{label}</span>
          </div>
        ))}
      </div>

      {/* Social copy */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Social Announcement</p>
        <div className="relative rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 leading-relaxed pr-10">
          {copyText}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-xs text-gray-400">Click the copy button to grab this for Instagram, X, Facebook, or LinkedIn.</p>
      </div>
    </div>
  );
}
