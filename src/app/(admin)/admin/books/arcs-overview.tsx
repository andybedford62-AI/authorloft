"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchArcs() {
      try {
        const response = await fetch("/api/admin/arcs");
        if (response.ok) {
          const data = await response.json();
          setArcsData(data.arcs || []);
        }
      } catch (error) {
        console.error("Failed to fetch ARCs", error);
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

  if (arcsData.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No ARCs created yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Edit a book to create an ARC and start inviting readers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {arcsData.map((arc) => (
        <Link
          key={arc.arcId}
          href={`/admin/books/${arc.bookId}/edit#arcs`}
          className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
        >
          <div className="flex gap-4">
            {arc.bookCover && (
              <img
                src={arc.bookCover}
                alt={arc.bookTitle}
                className="w-16 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{arc.bookTitle}</h3>
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <p>📁 {arc.fileCount} format{arc.fileCount !== 1 ? "s" : ""}</p>
                <p>
                  👥 {arc.readerCounts.total} reader{arc.readerCounts.total !== 1 ? "s" : ""} (
                  {arc.readerCounts.invited} invited, {arc.readerCounts.downloaded} downloaded,{" "}
                  {arc.readerCounts.reviewed} reviewed)
                </p>
                {arc.expiresAt && <p>📅 Expires: {new Date(arc.expiresAt).toLocaleDateString()}</p>}
              </div>
            </div>
            <div className="text-right">
              {arc.isActive ? (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Active
                </span>
              ) : (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
