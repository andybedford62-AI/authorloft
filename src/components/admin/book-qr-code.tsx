"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, QrCode } from "lucide-react";

type Props = {
  bookUrl: string;
  bookTitle: string;
};

export function BookQRCode({ bookUrl, bookTitle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href     = url;
    a.download = `${bookTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-qr-code.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-sm">QR Code</h3>
      </div>
      <p className="text-xs text-gray-400">
        Share on bookmarks, event tables, or author swag. Scans directly to this book&rsquo;s page.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* QR code */}
        <div ref={containerRef} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <QRCode value={bookUrl} size={120} level="M" />
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-mono break-all">{bookUrl}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download QR Code (SVG)
          </button>
        </div>
      </div>
    </div>
  );
}
