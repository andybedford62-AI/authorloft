"use client";

import { useState, useEffect, useRef } from "react";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { Upload, CheckCircle, XCircle, Loader2, Trash2, FileText, UserPlus, Mail } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ArcFile {
  id: string;
  format: string;
  fileName: string;
  fileSizeBytes?: number;
}

interface ArcData {
  id: string;
  disclaimer?: string;
  isActive: boolean;
  expiresAt?: string;
  files: ArcFile[];
  readerCounts: { total: number; invited: number; downloaded: number; reviewed: number };
}

interface UploadItem {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  format?: string;
}

interface ArcTabProps {
  bookId: string;
  bookTitle: string;
}

const ALLOWED_EXTS = new Set(["pdf", "epub", "mobi", "azw3"]);
const DEFAULT_DISCLAIMER = "This is an advance reader copy. Please do not share.";

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ArcTab({ bookId, bookTitle }: ArcTabProps) {
  const csrfToken = useCSRFToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [arc, setArc] = useState<ArcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [readers, setReaders] = useState<Array<{
    id: string; name: string; email: string; status: string;
    invitedAt: string | null; tokenExpiresAt: string | null;
  }>>([]);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => { loadArc(); }, [bookId]);
  useEffect(() => { if (arc) loadReaders(); }, [arc?.id, bookId]);

  async function loadArc() {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc`, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      const data = await res.json();
      if (data.arc) {
        setArc(data.arc);
        setDisclaimer(data.arc.disclaimer || DEFAULT_DISCLAIMER);
        setExpiresAt(data.arc.expiresAt ? new Date(data.arc.expiresAt).toISOString().split("T")[0] : "");
      }
    } catch {
      setError("Failed to load ARC");
    } finally {
      setLoading(false);
    }
  }

  async function loadReaders() {
    if (!arc) return;
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc/${arc.id}/readers`, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      const data = await res.json();
      if (data.readers) setReaders(data.readers);
    } catch {}
  }

  async function inviteReader() {
    if (!arc || !inviteName.trim() || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc/${arc.id}/readers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          tokenExpiresAt: inviteExpiry || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite reader");
      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteName("");
      setInviteEmail("");
      setInviteExpiry("");
      await loadReaders();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function createArc() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/books/${bookId}/arc`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ disclaimer, expiresAt: expiresAt || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create ARC");
      }
      await loadArc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating ARC");
    } finally {
      setCreating(false);
    }
  }

  // ── Upload logic ─────────────────────────────────────────────────────────────

  function getExt(name: string) {
    return name.split(".").pop()?.toLowerCase() ?? "";
  }

  function validateFiles(files: File[]): { valid: File[]; rejected: string[] } {
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const f of files) {
      if (ALLOWED_EXTS.has(getExt(f.name))) valid.push(f);
      else rejected.push(f.name);
    }
    return { valid, rejected };
  }

  async function uploadSingleFile(item: UploadItem, arcId: string): Promise<void> {
    const updateStatus = (patch: Partial<UploadItem>) =>
      setUploads((prev) =>
        prev.map((u) => (u.file === item.file ? { ...u, ...patch } : u))
      );

    updateStatus({ status: "uploading" });

    try {
      // Step 1 — get signed URL
      const urlRes = await fetch("/api/admin/upload/arc-file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arcId, bookId, fileName: item.file.name }),
      });

      if (!urlRes.ok) {
        const data = await urlRes.json().catch(() => ({}));
        throw new Error(data.error || "Could not start upload");
      }

      const { signedUrl, fileKey, fileUrl, format } = await urlRes.json();

      // Step 2 — upload directly to Supabase
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": item.file.type || "application/octet-stream" },
        body: item.file,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => uploadRes.statusText);
        throw new Error(`Upload failed (${uploadRes.status}): ${text}`);
      }

      // Step 3 — record in DB
      const completeRes = await fetch(`/api/admin/books/${bookId}/arc/${arcId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({
          format,
          fileUrl,
          fileKey,
          fileName: item.file.name,
          fileSizeBytes: item.file.size,
        }),
      });

      if (!completeRes.ok) {
        const data = await completeRes.json().catch(() => ({}));
        throw new Error(data.error || "Uploaded but could not save");
      }

      updateStatus({ status: "done", format });
    } catch (err) {
      updateStatus({ status: "error", error: err instanceof Error ? err.message : "Upload failed" });
    }
  }

  async function handleFiles(files: FileList | File[]) {
    if (!arc) return;
    const fileArr = Array.from(files);
    const { valid, rejected } = validateFiles(fileArr);

    if (rejected.length) {
      setError(`Unsupported file type(s): ${rejected.join(", ")}. Use PDF, EPUB, MOBI, or AZW3.`);
    } else {
      setError("");
    }
    if (!valid.length) return;

    const newItems: UploadItem[] = valid.map((f) => ({ file: f, status: "pending" }));
    setUploads((prev) => [...prev, ...newItems]);

    // Upload all in parallel
    await Promise.all(newItems.map((item) => uploadSingleFile(item, arc.id)));
    await loadArc();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  async function deleteFile(fileId: string) {
    if (!arc) return;
    if (!confirm("Remove this file? Readers will no longer be able to download it.")) return;
    const res = await fetch(
      `/api/admin/books/${bookId}/arc/${arc.id}/files?fileId=${fileId}`,
      { method: "DELETE", headers: { "X-CSRF-Token": csrfToken } }
    );
    if (res.ok) await loadArc();
    else setError("Failed to delete file");
  }

  function clearDoneUploads() {
    setUploads((prev) => prev.filter((u) => u.status !== "done" && u.status !== "error"));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading…</div>;
  }

  if (!arc) {
    return (
      <div className="space-y-6 py-6 max-w-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Create ARC for {bookTitle}</h3>
          <p className="text-sm text-gray-500">
            Set up an Advance Reader Copy so you can invite early readers and share pre-release files.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer</label>
            <textarea
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
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
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create ARC
          </button>
        </div>
      </div>
    );
  }

  const activeUploads = uploads.filter((u) => u.status === "uploading").length;
  const hasFinished = uploads.some((u) => u.status === "done" || u.status === "error");

  return (
    <div className="space-y-6 py-6 max-w-2xl">

      {/* Header stats */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">ARC Files</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {arc.readerCounts.total} reader{arc.readerCounts.total !== 1 ? "s" : ""} —{" "}
            {arc.readerCounts.invited} invited · {arc.readerCounts.downloaded} downloaded · {arc.readerCounts.reviewed} reviewed
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          arc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}>
          {arc.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Existing files */}
      {arc.files.length > 0 && (
        <div className="space-y-2">
          {arc.files.map((file) => (
            <div key={file.id} className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.format}</p>
                  <p className="text-xs text-gray-500">{file.fileName}{file.fileSizeBytes ? ` · ${formatBytes(file.fileSizeBytes)}` : ""}</p>
                </div>
              </div>
              <button
                onClick={() => deleteFile(file.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload queue */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              {item.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />}
              {item.status === "done"      && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
              {item.status === "error"     && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              {item.status === "pending"   && <Loader2 className="h-4 w-4 text-gray-400 animate-spin flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{item.file.name}</p>
                {item.error && <p className="text-xs text-red-500 mt-0.5">{item.error}</p>}
                {item.status === "uploading" && <p className="text-xs text-blue-500 mt-0.5">Uploading…</p>}
                {item.status === "done"      && <p className="text-xs text-green-600 mt-0.5">Uploaded as {item.format}</p>}
              </div>
            </div>
          ))}
          {hasFinished && activeUploads === 0 && (
            <button onClick={clearDoneUploads} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-8 py-10 cursor-pointer transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <Upload className={`h-6 w-6 ${dragging ? "text-blue-500" : "text-gray-400"}`} />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {activeUploads > 0 ? `Uploading ${activeUploads} file${activeUploads !== 1 ? "s" : ""}…` : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PDF · EPUB · MOBI · AZW3 — multiple files supported</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.epub,.mobi,.azw3"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* ── Invite readers ── */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Invite Readers
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Reader name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Link expires <span className="text-gray-400">(optional — overrides ARC default)</span></label>
            <input
              type="date"
              value={inviteExpiry}
              onChange={(e) => setInviteExpiry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={inviteReader}
              disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Invite
            </button>
          </div>
        </div>

        {inviteError   && <p className="text-sm text-red-600">{inviteError}</p>}
        {inviteSuccess && <p className="text-sm text-green-600">{inviteSuccess}</p>}
      </div>

      {/* ── Sent log ── */}
      {readers.length > 0 && (
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Invite Log</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Sent</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {readers.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.invitedAt ? new Date(r.invitedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.tokenExpiresAt
                        ? new Date(r.tokenExpiresAt).toLocaleDateString()
                        : <span className="text-gray-400 italic">No expiry</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "REVIEWED"   ? "bg-purple-100 text-purple-700" :
                        r.status === "DOWNLOADED" ? "bg-green-100 text-green-700" :
                        r.status === "INVITED"    ? "bg-blue-100 text-blue-700" :
                                                    "bg-gray-100 text-gray-600"
                      }`}>
                        {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
