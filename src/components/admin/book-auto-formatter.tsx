"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, Loader2, CheckCircle, XCircle, Download,
  ShoppingCart, Gift, BookOpen, Sparkles, ExternalLink, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/use-toast";

type JobStatus = "PENDING" | "CONVERTING" | "DONE" | "FAILED";

type FormatJob = {
  id: string;
  sourceName: string;
  status: JobStatus;
  errorMessage: string | null;
  chapterCount: number | null;
  wordCount: number | null;
  epubFileName: string | null;
  createdAt: string;
};

type AttachTarget = "direct-sales" | "reader-magnet" | "arc";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function BookAutoFormatter({ bookId }: { bookId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<FormatJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<"uploading" | "converting" | null>(null);
  const [error, setError] = useState("");
  const [attachingKey, setAttachingKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { loadJobs(); }, [bookId]);

  async function loadJobs() {
    setLoadingJobs(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/format/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs ?? []);
      }
    } finally {
      setLoadingJobs(false);
    }
  }

  async function handleFile(file: File) {
    setError("");
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError("Please upload a .docx file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File is too large. Manuscripts must be under 25 MB.");
      return;
    }

    setBusy("uploading");
    try {
      const urlRes = await fetch(`/api/admin/books/${bookId}/format/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });
      if (!urlRes.ok) {
        const data = await urlRes.json().catch(() => ({}));
        throw new Error(data.error || "Could not start upload.");
      }
      const { signedUrl, fileKey } = await urlRes.json();

      const putRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed. Please try again.");

      setBusy("converting");
      const convertRes = await fetch(`/api/admin/books/${bookId}/format/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey, fileName: file.name }),
      });
      const convertData = await convertRes.json().catch(() => ({}));
      if (!convertRes.ok) throw new Error(convertData.error || "Conversion failed.");

      showToast("success", "Manuscript converted to ePub");
      await loadJobs();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function attach(jobId: string, target: AttachTarget) {
    const key = `${jobId}:${target}`;
    setAttachingKey(key);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/format/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not attach file.");

      const labels: Record<AttachTarget, string> = {
        "direct-sales": "Attached to Direct Sales (eBook)",
        "reader-magnet": "Set as Reader Magnet",
        arc: "Attached to ARC",
      };
      showToast("success", labels[target]);
    } catch (err: any) {
      showToast("error", err?.message ?? "Could not attach file.");
    } finally {
      setAttachingKey(null);
    }
  }

  async function deleteJob(jobId: string) {
    if (!confirm("Delete this conversion? This removes the stored files too — it won't affect anything already attached to Direct Sales, Reader Magnet, or ARC.")) return;
    setDeletingId(jobId);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/format/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete conversion.");
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err: any) {
      showToast("error", err?.message ?? "Could not delete conversion.");
    } finally {
      setDeletingId(null);
    }
  }

  const busyLabel = busy === "uploading" ? "Uploading…" : busy === "converting" ? "Converting…" : null;

  return (
    <div className="space-y-6 py-6 max-w-2xl">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Auto-Formatter
        </p>
        <p className="leading-relaxed">
          Upload your manuscript as a <strong>.docx</strong> file and we&rsquo;ll convert it into a
          clean, sellable <strong>.epub</strong> — using your document&rsquo;s Heading 1 styles as
          chapter breaks. Great for a typical novel manuscript (headings, paragraphs, bold/italic,
          simple images). It won&rsquo;t perfectly handle footnotes, complex tables, or heavy custom
          styling — for advanced formatting needs, see our{" "}
          <a href="/guides/docx-to-epub-conversion-guide" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">
            full conversion guide <ExternalLink className="h-3 w-3" />
          </a>.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !busy && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-8 py-10 transition-colors ${
          busy ? "cursor-wait opacity-70" : "cursor-pointer"
        } ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        ) : (
          <Upload className={`h-6 w-6 ${dragging ? "text-blue-500" : "text-gray-400"}`} />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {busyLabel ?? "Drop your .docx manuscript here or click to browse"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">.docx only — up to 25 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          disabled={!!busy}
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Recent conversions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Recent conversions</h3>
        {loadingJobs ? (
          <div className="flex items-center gap-2 py-4 text-gray-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No conversions yet.</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="px-4 py-3 bg-white border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {job.status === "DONE" && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                    {job.status === "FAILED" && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    {(job.status === "PENDING" || job.status === "CONVERTING") && (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{job.sourceName}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(job.createdAt)}
                        {job.status === "DONE" && job.chapterCount != null && (
                          <> · {job.chapterCount} chapter{job.chapterCount !== 1 ? "s" : ""} · {job.wordCount?.toLocaleString()} words</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {job.status === "DONE" && (
                      <a
                        href={`/api/admin/books/${bookId}/format/download/${job.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    )}
                    <button
                      type="button"
                      title="Delete this conversion"
                      disabled={deletingId === job.id}
                      onClick={() => deleteJob(job.id)}
                      className="inline-flex items-center justify-center h-6 w-6 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deletingId === job.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {job.status === "FAILED" && job.errorMessage && (
                  <p className="text-xs text-red-600">{job.errorMessage}</p>
                )}

                {job.status === "DONE" && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={attachingKey === `${job.id}:direct-sales`}
                      onClick={() => attach(job.id, "direct-sales")}
                    >
                      {attachingKey === `${job.id}:direct-sales`
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        : <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />}
                      Use for Direct Sales
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={attachingKey === `${job.id}:reader-magnet`}
                      onClick={() => attach(job.id, "reader-magnet")}
                    >
                      {attachingKey === `${job.id}:reader-magnet`
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        : <Gift className="h-3.5 w-3.5 mr-1.5" />}
                      Use for Reader Magnet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={attachingKey === `${job.id}:arc`}
                      onClick={() => attach(job.id, "arc")}
                    >
                      {attachingKey === `${job.id}:arc`
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        : <BookOpen className="h-3.5 w-3.5 mr-1.5" />}
                      Use for ARC
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
        <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <p>
          Best results: use Word&rsquo;s actual &ldquo;Heading 1&rdquo; style for chapter titles, and
          avoid embedded text boxes or complex tables. Read the{" "}
          <a href="/guides/docx-to-epub-conversion-guide" target="_blank" rel="noopener noreferrer" className="underline">
            full formatting guide
          </a>{" "}
          for tips and external tool recommendations (Calibre, Pandoc, Draft2Digital, Vellum).
        </p>
      </div>
    </div>
  );
}
