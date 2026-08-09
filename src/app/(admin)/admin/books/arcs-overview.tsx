"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

interface ArcData {
  arcId: string;
  bookId: string;
  bookTitle: string;
  bookCover: string | null;
  isActive: boolean;
  expiresAt: string | null;
  fileCount: number;
  readerCounts: {
    total: number;
    invited: number;
    downloaded: number;
    reviewed: number;
  };
}

interface BookRow {
  id: string;
  title: string;
}

interface ArcsOverviewProps {
  books: BookRow[];
}

export function ArcsOverview({ books }: ArcsOverviewProps) {
  const [arcsData, setArcsData] = useState<ArcData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function fetchArcs() {
      try {
        const response = await fetch("/api/admin/arcs");
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setFetchError(data.error || "Failed to load ARCs");
          return;
        }
        const data = await response.json();
        setArcsData(data.arcs || []);
      } catch {
        setFetchError("Failed to load ARCs — please refresh the page");
      } finally {
        setLoading(false);
      }
    }

    fetchArcs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading ARCs...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700 font-medium">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Explainer banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Your ARC Programme</p>
        <p className="leading-relaxed">
          This page shows all books that have an Advanced Reader Copy set up. Each card below
          represents a book with an active or past ARC. <strong>Click any book</strong> to open
          its ARC tab where you can manage files, invite readers, track downloads, and adjust
          the expiry date.
        </p>
        <p className="mt-2 leading-relaxed">
          To create an ARC for a book that isn&apos;t listed here, go to{" "}
          <strong>Books → Edit Book → ARC tab</strong>.
        </p>
      </div>

      {arcsData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 space-y-3">
          <BookOpen className="h-10 w-10 text-gray-200 mx-auto" />
          <p className="font-medium text-gray-500">No ARCs created yet</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Open any book, go to the <strong>ARC tab</strong>, and set up your first
            Advanced Reader Copy to start sharing pre-release files with reviewers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {arcsData.map((arc) => (
            <Link
              key={arc.arcId}
              href={`/admin/books/${arc.bookId}/edit?tab=arcs`}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              {arc.bookCover ? (
                <img
                  src={arc.bookCover}
                  alt={arc.bookTitle}
                  className="w-14 h-20 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{arc.bookTitle}</h3>
                <div className="text-sm text-gray-500 mt-1.5 space-y-0.5">
                  <p>{arc.fileCount} file format{arc.fileCount !== 1 ? "s" : ""}</p>
                  <p>
                    {arc.readerCounts.total} reader{arc.readerCounts.total !== 1 ? "s" : ""} —{" "}
                    {arc.readerCounts.invited} invited · {arc.readerCounts.downloaded} downloaded · {arc.readerCounts.reviewed} reviewed
                  </p>
                  {arc.expiresAt && (
                    <p>Expires {new Date(arc.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {arc.isActive ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    Inactive
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:underline">
                  Manage ARC <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
