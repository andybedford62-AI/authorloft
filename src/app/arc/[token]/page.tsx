"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ArcData {
  reader: { id: string; name: string; email: string };
  arc: { id: string; bookTitle: string; disclaimer?: string; expiresAt?: string };
  files: Array<{
    id: string;
    format: string;
    fileName: string;
    fileSizeBytes?: number;
    downloaded: boolean;
  }>;
  disclaimerAcknowledged: boolean;
}

export default function ArcDownloadPage() {
  const params = useParams();
  const token = params.token as string;
  const [arc, setArc] = useState<ArcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadArc();
  }, []);

  async function loadArc() {
    try {
      const res = await fetch(`/api/arc/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid or expired link");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setArc(data);
      setDisclaimerAcknowledged(data.disclaimerAcknowledged);
      setLoading(false);
    } catch (err) {
      setError("Failed to load ARC");
      setLoading(false);
    }
  }

  async function acknowledgDisclaimer() {
    try {
      const res = await fetch(`/api/arc/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge-disclaimer" }),
      });
      if (res.ok) {
        setDisclaimerAcknowledged(true);
      }
    } catch (err) {
      console.error("Error acknowledging disclaimer");
    }
  }

  async function downloadFile(fileId: string, fileName: string, format: string) {
    try {
      setDownloading(fileId);
      const res = await fetch(`/api/arc/${token}/download/${fileId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Download failed — please try again");
        return;
      }

      const data = await res.json();

      // Create download link
      const a = document.createElement("a");
      a.href = data.fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Error downloading file");
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Please check your link and try again.</p>
        </div>
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">ARC not found</p>
      </div>
    );
  }

  const isExpired = arc.arc.expiresAt && new Date() > new Date(arc.arc.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{arc.arc.bookTitle}</h1>
        <p className="text-gray-600 mb-6">Advance Reader Copy for {arc.reader.name}</p>

        {isExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">⚠️ This link has expired</p>
            <p className="text-red-700 text-sm mt-1">
              Expired on {new Date(arc.arc.expiresAt!).toLocaleDateString()}
            </p>
          </div>
        )}

        {arc.arc.disclaimer && !disclaimerAcknowledged && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-900 font-medium mb-3">📋 Disclaimer</p>
            <p className="text-blue-800 text-sm mb-4">{arc.arc.disclaimer}</p>
            <button
              onClick={acknowledgDisclaimer}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              I Agree
            </button>
          </div>
        )}

        {disclaimerAcknowledged && !isExpired && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Available Formats</h2>
            <div className="space-y-3">
              {arc.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{file.format}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.fileSizeBytes ? (file.fileSizeBytes / 1024 / 1024).toFixed(1) + " MB" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(file.id, file.fileName, file.format)}
                    disabled={downloading === file.id || isExpired}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading === file.id ? "Downloading..." : "Download"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
