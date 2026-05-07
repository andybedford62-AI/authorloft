"use client";

import { useState } from "react";
import { BookOpen, Download, CheckSquare, Square } from "lucide-react";

type Props = {
  token: string;
  readerName: string;
  bookTitle: string;
  authorName: string;
  fileName: string;
  disclaimer: string;
  alreadyDownloaded: boolean;
};

export function DownloadClient({
  token,
  readerName,
  bookTitle,
  authorName,
  fileName,
  disclaimer,
  alreadyDownloaded,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (!acknowledged) return;
    setDownloading(true);
    setError("");
    try {
      const res = await fetch(`/api/arc/acknowledge/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not download. Please try again.");
        return;
      }
      window.location.href = data.signedUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e40af] px-8 py-6">
          <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">AuthorLoft</p>
          <h1 className="text-white text-xl font-bold">Advance Reader Copy</h1>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Book info */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{bookTitle}</p>
              <p className="text-sm text-gray-500">by {authorName}</p>
              <p className="text-xs text-gray-400 mt-0.5">For: {readerName}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">
              Terms &amp; Conditions
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">{disclaimer}</p>
          </div>

          {/* Acknowledge checkbox */}
          <button
            type="button"
            onClick={() => setAcknowledged((v) => !v)}
            className="flex items-start gap-3 w-full text-left group"
          >
            <div className="flex-shrink-0 mt-0.5">
              {acknowledged ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 leading-snug">
              I have read and agree to the terms above. I will post an honest review and will not
              share or resell this copy.
            </p>
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!acknowledged || downloading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
              acknowledged && !downloading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing download…" : alreadyDownloaded ? "Download Again" : `Download ${fileName}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by{" "}
            <a href="https://www.authorloft.com" className="text-gray-500 hover:underline">
              AuthorLoft
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
