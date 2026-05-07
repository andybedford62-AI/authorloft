"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { ArcUploadSection } from "./arc-upload-section";
import { ArcReaderTable } from "./arc-reader-table";
import { ArcInviteModal, type ArcReaderRow } from "./arc-invite-modal";

type ArcCopy = {
  id: string;
  fileName: string;
  isActive: boolean;
  disclaimer: string | null;
  expiresAt: string | null;
  createdAt: string;
  readers: ArcReaderRow[];
};

type Props = { bookId: string };

export function ArcTab({ bookId }: Props) {
  const [arcCopies, setArcCopies] = useState<ArcCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const activeCopy = arcCopies.find((a) => a.isActive) ?? arcCopies[0] ?? null;

  useEffect(() => {
    fetch(`/api/admin/books/${bookId}/arc`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setArcCopies(data);
      })
      .finally(() => setLoading(false));
  }, [bookId]);

  function handleArcUpdate(updated: Omit<ArcCopy, "readers">) {
    setArcCopies((prev) => {
      const exists = prev.find((a) => a.id === updated.id);
      if (exists) {
        return prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a));
      }
      return [{ ...updated, readers: [] }, ...prev];
    });
  }

  function handleArcDelete() {
    if (activeCopy) {
      setArcCopies((prev) => prev.filter((a) => a.id !== activeCopy.id));
    }
  }

  function handleReaderAdded(reader: ArcReaderRow) {
    if (!activeCopy) return;
    setArcCopies((prev) =>
      prev.map((a) =>
        a.id === activeCopy.id ? { ...a, readers: [reader, ...a.readers] } : a
      )
    );
    setShowInvite(false);
  }

  function handleReaderUpdated(updated: ArcReaderRow) {
    setArcCopies((prev) =>
      prev.map((a) => ({
        ...a,
        readers: a.readers.map((r) => (r.id === updated.id ? updated : r)),
      }))
    );
  }

  function handleReaderRemoved(id: string) {
    setArcCopies((prev) =>
      prev.map((a) => ({
        ...a,
        readers: a.readers.filter((r) => r.id !== id),
      }))
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {/* File upload + settings */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <ArcUploadSection
          bookId={bookId}
          arcCopy={
            activeCopy
              ? {
                  id: activeCopy.id,
                  fileName: activeCopy.fileName,
                  isActive: activeCopy.isActive,
                  disclaimer: activeCopy.disclaimer,
                  expiresAt: activeCopy.expiresAt,
                  createdAt: activeCopy.createdAt,
                }
              : null
          }
          onUpdate={handleArcUpdate}
          onDelete={handleArcDelete}
        />
      </div>

      {/* Reader list */}
      {activeCopy && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Readers</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeCopy.readers.length} reader{activeCopy.readers.length !== 1 ? "s" : ""}
                {" · "}
                {activeCopy.readers.filter((r) => r.status === "REVIEWED").length} reviewed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Invite Reader
            </button>
          </div>

          <ArcReaderTable
            bookId={bookId}
            arcCopyId={activeCopy.id}
            readers={activeCopy.readers}
            onUpdate={handleReaderUpdated}
            onRemove={handleReaderRemoved}
          />
        </div>
      )}

      {showInvite && activeCopy && (
        <ArcInviteModal
          bookId={bookId}
          arcCopyId={activeCopy.id}
          onAdded={handleReaderAdded}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
