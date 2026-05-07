"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";

type ArcCopy = {
  id: string;
  fileName: string;
  isActive: boolean;
  disclaimer: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type Props = {
  bookId: string;
  arcCopy: ArcCopy | null;
  onUpdate: (arc: ArcCopy) => void;
  onDelete: () => void;
};

export function ArcUploadSection({ bookId, arcCopy, onUpdate, onDelete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [disclaimer, setDisclaimer] = useState(arcCopy?.disclaimer ?? "");
  const [expiresAt, setExpiresAt] = useState(
    arcCopy?.expiresAt ? arcCopy.expiresAt.split("T")[0] : ""
  );
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress("Getting upload URL…");

    try {
      const urlRes = await fetch("/api/admin/upload/arc-file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, fileName: file.name }),
      });
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error ?? "Failed to get upload URL");

      setProgress("Uploading file…");
      const uploadRes = await fetch(urlData.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      setProgress("Saving…");
      const completeRes = await fetch("/api/admin/upload/arc-file-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          fileKey: urlData.fileKey,
          fileName: file.name,
          arcCopyId: arcCopy?.id ?? null,
        }),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) throw new Error(completeData.error ?? "Failed to save ARC");

      onUpdate(completeData);
      setProgress("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      alert(msg);
      setProgress("");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSaveMeta() {
    if (!arcCopy) return;
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc/${arcCopy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disclaimer: disclaimer.trim() || null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      onUpdate({ ...arcCopy, disclaimer: data.disclaimer, expiresAt: data.expiresAt });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      alert(msg);
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleDelete() {
    if (!arcCopy) return;
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc/${arcCopy.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onDelete();
      setDeleteConfirm(false);
    } catch {
      alert("Could not delete ARC. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">ARC File</h3>
        {arcCopy && (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove ARC
          </button>
        )}
      </div>

      {arcCopy ? (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 truncate">{arcCopy.fileName}</p>
            <p className="text-xs text-blue-500">
              Uploaded {new Date(arcCopy.createdAt).toLocaleDateString()}
            </p>
          </div>
          <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0">
            Replace
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.mobi"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${uploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}>
          <Upload className="h-7 w-7 text-gray-400" />
          <p className="text-sm text-gray-500">
            {uploading ? progress : "Click to upload PDF, ePub, or MOBI"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.epub,.mobi"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {uploading && progress && (
        <p className="text-xs text-blue-600 animate-pulse">{progress}</p>
      )}

      {arcCopy && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Link expiry date (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full sm:w-48 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">All reader download links will expire on this date.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Disclaimer (leave blank to use the platform default)
            </label>
            <textarea
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              placeholder={DEFAULT_ARC_DISCLAIMER}
              rows={4}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveMeta}
            disabled={savingMeta}
            className="text-sm bg-gray-800 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {savingMeta ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Remove ARC file?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will delete the file and invalidate all existing reader links. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
