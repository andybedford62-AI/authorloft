"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Youtube, Loader2, AlertTriangle, CheckCircle2, RotateCcw, GraduationCap, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MappedCourseImport } from "@/lib/csv-import-courses";

// YouTube playlist → draft course. Fetches a preview from
// /api/admin/courses/import-youtube, then submits through the same
// /api/admin/courses/import endpoint the CSV wizard uses, so both paths share
// plan limits, dedup and draft-only behavior. Styles mirror CourseImportWizard.

type Step = "input" | "preview" | "results";

type Preview = {
  course: MappedCourseImport;
  source: "api" | "rss";
  warnings: string[];
};

type ImportResult = {
  imported: number;
  skippedForPlanLimit: number;
  warnings: string[];
};

interface Props {
  remainingSlots: number | null; // null = unlimited
  planTier: string;
}

export function YouTubeImportPanel({ remainingSlots, planTier }: Props) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [courseTitle, setCourseTitle] = useState("");

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const atPlanLimit = remainingSlots !== null && remainingSlots <= 0;

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/courses/import-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not fetch that playlist.");
      setPreview(data);
      setCourseTitle(data.course.title);
      setStep("preview");
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Could not fetch that playlist.");
    } finally {
      setFetching(false);
    }
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    setImportError("");
    try {
      const course = { ...preview.course, title: courseTitle.trim() || preview.course.title };
      const res = await fetch("/api/admin/courses/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: [course] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Import failed.");
      setResult({ ...data, warnings: [...preview.warnings, ...(data.warnings ?? [])] });
      setStep("results");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  function startOver() {
    setStep("input");
    setUrl("");
    setPreview(null);
    setResult(null);
    setFetchError("");
    setImportError("");
  }

  const lessons = preview?.course.modules.flatMap((m) => m.lessons) ?? [];

  return (
    <div className="space-y-5">
      {/* ── Step 1: playlist URL ── */}
      {step === "input" && (
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-50 p-2 flex-shrink-0">
              <Youtube className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">
              Paste a public YouTube playlist link. Each video becomes a lesson — title and description
              pre-filled, video embedded — and the course lands as a draft for you to review, reorganize
              into modules, and publish.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=…"
              required
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Button type="submit" disabled={fetching || atPlanLimit} className="flex-shrink-0">
              {fetching
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching…</>
                : "Fetch Playlist"}
            </Button>
          </div>

          {atPlanLimit && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Your <strong>{planTier}</strong> plan's course limit is reached.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to import more.
              </span>
            </div>
          )}

          {fetchError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{fetchError}</span>
            </div>
          )}
        </form>
      )}

      {/* ── Step 2: preview ── */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Course title</label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {preview.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}

          <div className="max-h-[24rem] overflow-auto rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm truncate">{courseTitle || preview.course.title}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-gray-50">
              {lessons.map((lesson, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600">
                  <Play className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  <span className="truncate">{lesson.title}</span>
                  {!lesson.contentHtml && (
                    <Badge variant="outline" className="text-[10px] py-0 flex-shrink-0">no description</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {importError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={startOver} disabled={importing}>
              Cancel
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing || lessons.length === 0}>
              {importing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing…</>
                : `Import ${lessons.length} Lesson${lessons.length === 1 ? "" : "s"} as Draft Course`}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: results ── */}
      {step === "results" && result && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                Imported {result.imported} course{result.imported === 1 ? "" : "s"} as draft{result.imported === 1 ? "" : "s"}.
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Review it in My Courses — split lessons into modules, add a cover and pricing, then publish when ready.
              </p>
            </div>
          </div>

          {result.skippedForPlanLimit > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Skipped — your <strong>{planTier}</strong> plan limit was reached.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> and try again.
              </span>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
              {result.warnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link href="/admin/courses">
              <Button type="button">Go to My Courses</Button>
            </Link>
            <Button type="button" variant="ghost" onClick={startOver}>
              <RotateCcw className="h-4 w-4 mr-2" /> Import another playlist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
