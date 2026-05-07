"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { BookForm } from "@/components/admin/book-form";
import { RetailerLinks } from "@/components/admin/retailer-links";
import { DirectSalesItems } from "@/components/admin/direct-sales-items";
import { BookAudioTracks } from "@/components/admin/book-audio-tracks";
import { BookPreviewMedia } from "@/components/admin/book-preview-media";
import { BookReviews } from "@/components/admin/book-reviews";
import { BookExcerptEditor } from "@/components/admin/book-excerpt-editor";
import { ArcTab } from "@/components/admin/books/arc/arc-tab";
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
  arcEnabled: boolean;
  stripeConnectOnboarded: boolean;
  previewMedia: PreviewMedia[];
};

type TabId = "details" | "organisation" | "buy-links" | "direct-sales" | "media" | "reviews" | "excerpt" | "arcs";

const TABS: { id: TabId; label: string }[] = [
  { id: "details",       label: "Details" },
  { id: "organisation",  label: "Organisation" },
  { id: "buy-links",     label: "Buy Links" },
  { id: "direct-sales",  label: "Direct Sales" },
  { id: "media",         label: "Media" },
  { id: "reviews",       label: "Reviews" },
  { id: "excerpt",       label: "Excerpt" },
  { id: "arcs",          label: "ARCs" },
];

export function BookEditTabsClient({ book, series, genres, audioEnabled, salesEnabled, arcEnabled, stripeConnectOnboarded, previewMedia }: Props) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId) ?? "details";
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "details"
  );

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
      />

      {/* ── Standalone tab panels — mounted only when active ── */}
      {activeTab === "buy-links" && (
        <div className="max-w-3xl">
          <RetailerLinks bookId={book.id} />
        </div>
      )}

      {activeTab === "direct-sales" && (
        <div className="max-w-3xl">
          <DirectSalesItems bookId={book.id} salesEnabled={salesEnabled} stripeConnectOnboarded={stripeConnectOnboarded} />
        </div>
      )}

      {activeTab === "media" && (
        <div className="max-w-3xl space-y-6">
          <BookPreviewMedia bookId={book.id} initial={previewMedia} />
          <BookAudioTracks bookId={book.id} audioEnabled={audioEnabled} />
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
            <ArcTab bookId={book.id} />
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
