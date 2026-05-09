"use client";

import { useState, useEffect } from "react";
import { useCSRFToken } from "@/hooks/use-csrf-token";

interface ArcData {
  id: string;
  disclaimer?: string;
  isActive: boolean;
  expiresAt?: string;
  files: Array<{ id: string; format: string; fileName: string; fileSizeBytes?: number }>;
  readerCounts: { total: number; invited: number; downloaded: number; reviewed: number };
}

interface ArcTabProps {
  bookId: string;
  bookTitle: string;
}

export function ArcTab({ bookId, bookTitle }: ArcTabProps) {
  const csrfToken = useCSRFToken();
  const [arc, setArc] = useState<ArcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadArc();
  }, []);

  async function loadArc() {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc`, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      const data = await res.json();
      if (data.arc) {
        setArc(data.arc);
        setDisclaimer(data.arc.disclaimer || "");
        setExpiresAt(data.arc.expiresAt ? new Date(data.arc.expiresAt).toISOString().split("T")[0] : "");
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load ARC");
      setLoading(false);
    }
  }

  async function createArc() {
    try {
      setError("");
      const res = await fetch(`/api/admin/books/${bookId}/arc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          disclaimer,
          expiresAt: expiresAt || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create ARC");
      await loadArc();
    } catch (err) {
      setError("Error creating ARC");
    }
  }

  async function uploadFile(format: string, file: File) {
    try {
      setError("");
      setUploading(true);

      // In production, upload to S3/storage first and get fileUrl/fileKey
      // For now, we'll create a placeholder
      const fileUrl = URL.createObjectURL(file);
      const fileKey = `arc/${bookId}/${format}/${file.name}`;

      const res = await fetch(`/api/admin/books/${bookId}/arc/${arc?.id}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          format,
          fileUrl,
          fileKey,
          fileName: file.name,
          fileSizeBytes: file.size,
        }),
      });

      if (!res.ok) throw new Error("Failed to upload file");
      await loadArc();
    } catch (err) {
      setError("Error uploading file");
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileId: string) {
    try {
      const res = await fetch(
        `/api/admin/books/${bookId}/arc/${arc?.id}/files?fileId=${fileId}`,
        {
          method: "DELETE",
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      if (!res.ok) throw new Error("Failed to delete file");
      await loadArc();
    } catch (err) {
      setError("Error deleting file");
    }
  }

  if (loading) return <div className="py-8 text-center text-gray-500">Loading ARC...</div>;

  if (!arc) {
    return (
      <div className="space-y-6 py-8">
        <p className="text-gray-600">Create an Advance Reader Copy for {bookTitle}.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disclaimer</label>
            <textarea
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              placeholder="e.g., This is an advance reader copy. Please do not share."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={createArc}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Create ARC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">File Formats</h3>
        {arc.files.length === 0 ? (
          <p className="text-sm text-gray-500">No formats uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {arc.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="font-medium text-sm text-gray-900">{file.format}</p>
                  <p className="text-xs text-gray-500">{file.fileName}</p>
                </div>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 space-y-3">
          {["PDF", "EPUB", "MOBI", "AZW3"].map((format) => (
            <label key={format} className="flex items-center">
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && uploadFile(format, e.target.files[0])}
                disabled={uploading || arc.files.some((f) => f.format === format)}
                className="hidden"
              />
              <span className="cursor-pointer px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                Upload {format}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-semibold text-gray-900 mb-3">Readers</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>👥 Total: {arc.readerCounts.total}</p>
          <p>📨 Invited: {arc.readerCounts.invited}</p>
          <p>⬇️ Downloaded: {arc.readerCounts.downloaded}</p>
          <p>⭐ Reviewed: {arc.readerCounts.reviewed}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
