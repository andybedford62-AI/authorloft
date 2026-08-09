"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { ReaderMagnetModal } from "./reader-magnet-modal";

type Props = {
  bookId: string;
  saleItemId: string;
  authorId: string;
  bookTitle: string;
  format: string;
  label: string;
  coverImageUrl?: string | null;
  accentColor: string;
  formatColor: string;
  formatBg: string;
};

export function ReaderMagnetButton({
  bookId,
  saleItemId,
  authorId,
  bookTitle,
  label,
  coverImageUrl,
  accentColor,
  formatColor,
  formatBg,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ borderColor: formatColor, color: formatColor, backgroundColor: formatBg }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-opacity hover:opacity-80"
      >
        <Gift className="h-3.5 w-3.5" />
        {label} — Free
      </button>

      {open && (
        <ReaderMagnetModal
          bookId={bookId}
          saleItemId={saleItemId}
          authorId={authorId}
          bookTitle={bookTitle}
          format="EBOOK"
          coverImageUrl={coverImageUrl}
          accentColor={accentColor}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
