"use client";

import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

/** Compact, public-facing QR code shown on the book detail page. No download UI. */
export function BookQRCodePublic({
  bookUrl,
  size = 96,
  label = "Scan to share",
}: {
  bookUrl: string;
  size?: number;
  label?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
        <QRCode value={bookUrl} size={size} level="M" />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
        <QrCode className="h-3.5 w-3.5 text-gray-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}
