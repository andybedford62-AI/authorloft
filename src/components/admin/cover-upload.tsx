"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, UploadCloud, X, ImageIcon, Link2 } from "lucide-react";

interface CoverUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function CoverUpload({ value, onChange, label = "Cover Image" }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(!!value);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploadError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/cover", { method: "POST", body });
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const msg = contentType.includes("application/json")
          ? (await res.json()).error
          : `Upload failed (HTTP ${res.status})`;
        setUploadError(msg ?? "Upload failed. Please try again.");
      } else {
        const data = await res.json();
        onChange(data.url);
      }
    } catch {
      setUploadError("Network error — could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (value) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{label} <span className="font-normal text-gray-400">(optional)</span></label>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview"
            className="h-44 w-auto rounded-lg shadow border border-gray-200 object-cover" />
          <div className="flex flex-col gap-2 pt-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60">
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading…</>
                : <><UploadCloud className="h-3.5 w-3.5" />Replace image</>}
            </button>
            <button type="button" onClick={() => setShowUrlInput((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <Link2 className="h-3.5 w-3.5" />
              {showUrlInput ? "Hide URL" : "Paste URL instead"}
            </button>
            <button type="button" onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors">
              <X className="h-3.5 w-3.5" />Remove
            </button>
          </div>
        </div>
        {showUrlInput && (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        )}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label} <span className="font-normal text-gray-400">(optional)</span></label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"}
          ${uploading ? "pointer-events-none opacity-70" : ""}`}>
        {uploading ? (
          <><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /><p className="text-sm text-gray-500">Uploading…</p></>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow border border-gray-200">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop an image here, or{" "}
                <span className="text-blue-600 underline underline-offset-2">click to browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP or GIF · max 5 MB</p>
            </div>
          </>
        )}
      </div>
      <div className="space-y-1">
        <button type="button" onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <Link2 className="h-3 w-3" />
          {showUrlInput ? "Hide URL field" : "Or paste an image URL instead"}
        </button>
        {showUrlInput && (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        )}
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only" onChange={handleFileChange} />
    </div>
  );
}
