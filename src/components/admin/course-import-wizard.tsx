"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  UploadCloud, FileText, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  AlertTriangle, Download, RotateCcw, ChevronDown, ChevronRight, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  COURSE_LESSON_FIELDS, type CourseLessonFieldKey, type CourseColumnMapping,
  type MappedLessonRow, type MappedCourseImport,
  detectMapping, mapLessonRow, groupRowsIntoCourses,
  MAX_IMPORT_ROWS, MAX_IMPORT_FILE_SIZE_BYTES,
} from "@/lib/csv-import-courses";

type Step = "upload" | "map" | "preview" | "results";

type ImportResult = {
  imported: number;
  skippedForPlanLimit: number;
  warnings: string[];
};

interface Props {
  remainingSlots: number | null; // null = unlimited
  maxCourses: number | null;
  planTier: string;
}

const selectClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function CourseImportWizard({ remainingSlots, maxCourses, planTier }: Props) {
  const [step, setStep] = useState<Step>("upload");

  // Upload
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<CourseColumnMapping>({});
  const [parseError, setParseError] = useState("");
  const [parseWarning, setParseWarning] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Map
  const [mapError, setMapError] = useState("");

  // Preview
  const [courses, setCourses] = useState<MappedCourseImport[]>([]);
  const [skippedRowCount, setSkippedRowCount] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Import / results
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  // ── Step 1: Upload ──────────────────────────────────────────────────────
  function handleFile(file: File) {
    setParseError("");
    setParseWarning("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      setParseError(`File is too large (max ${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)} MB).`);
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        if (fields.length === 0) {
          setParseError("Couldn't read any columns from this file. Make sure it's a CSV with a header row.");
          return;
        }

        let rows = results.data.filter((r) => Object.values(r).some((v) => (v ?? "").toString().trim() !== ""));
        if (rows.length === 0) {
          setParseError("This file doesn't contain any data rows.");
          return;
        }
        if (rows.length > MAX_IMPORT_ROWS) {
          setParseWarning(`This file has ${rows.length} rows — only the first ${MAX_IMPORT_ROWS} will be processed.`);
          rows = rows.slice(0, MAX_IMPORT_ROWS);
        }

        setHeaders(fields);
        setRawRows(rows);
        setMapping(detectMapping(fields));
        setFileName(file.name);
        setStep("map");
      },
      error: (err) => setParseError(`Couldn't parse this file: ${err.message}`),
    });
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  // ── Step 2: Map Columns ─────────────────────────────────────────────────
  function setFieldMapping(field: CourseLessonFieldKey, header: string) {
    setMapping((prev) => {
      const next = { ...prev };
      if (header) next[field] = header;
      else delete next[field];
      return next;
    });
    setMapError("");
  }

  function proceedToPreview() {
    if (!mapping.courseTitle) {
      setMapError("Map a column to Course Title before continuing — it's required.");
      return;
    }
    if (!mapping.lessonTitle) {
      setMapError("Map a column to Lesson Title before continuing — it's required.");
      return;
    }
    const lessonRows: MappedLessonRow[] = rawRows.map((r) => mapLessonRow(r, mapping));
    const skipped = lessonRows.filter((r) => r.courseTitle.trim() === "" || r.lessonTitle.trim() === "").length;
    setSkippedRowCount(skipped);
    setCourses(groupRowsIntoCourses(lessonRows));
    setCollapsed(new Set());
    setStep("preview");
  }

  // ── Step 3: Preview ─────────────────────────────────────────────────────
  const importCount     = remainingSlots === null ? courses.length : Math.min(courses.length, remainingSlots);
  const skippedForLimit = courses.length - importCount;
  const totalModules    = courses.reduce((s, c) => s + c.modules.length, 0);
  const totalLessons    = courses.reduce((s, c) => s + c.modules.reduce((s2, m) => s2 + m.lessons.length, 0), 0);
  const lessonsMissingContent = courses.reduce(
    (s, c) => s + c.modules.reduce((s2, m) => s2 + m.lessons.filter((l) => !l.contentHtml && !l.videoUrl).length, 0),
    0
  );

  function toggleCollapsed(i: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  // ── Step 4: Import ───────────────────────────────────────────────────────
  async function handleImport() {
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch("/api/admin/courses/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ courses: courses.slice(0, importCount) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = typeof data.error === "string" ? data.error : "Import failed. Please try again.";
        throw new Error(message);
      }
      const data: ImportResult = await res.json();
      setResult(data);
      setStep("results");
    } catch (err: any) {
      setImportError(err.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  function startOver() {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setCourses([]);
    setSkippedRowCount(0);
    setParseError("");
    setParseWarning("");
    setMapError("");
    setImportError("");
    setResult(null);
  }

  // ── Step indicator ────────────────────────────────────────────────────────
  const STEPS: { id: Step; label: string }[] = [
    { id: "upload",  label: "Upload" },
    { id: "map",     label: "Map Columns" },
    { id: "preview", label: "Preview" },
    { id: "results", label: "Done" },
  ];
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < stepIndex ? "bg-emerald-100 text-emerald-700"
                : i === stepIndex ? "bg-[var(--accent)] text-white"
                : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === stepIndex ? "font-semibold text-gray-900" : "text-gray-400"}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors cursor-pointer
              ${dragging ? "border-[var(--accent)] bg-[color:var(--accent)]/5" : "border-gray-300 bg-gray-50 hover:border-[var(--accent)] hover:bg-[color:var(--accent)]/5"}`}
          >
            <UploadCloud className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Drop your CSV here, or click to browse</p>
            <p className="text-xs text-gray-400">One row per lesson — up to {MAX_IMPORT_ROWS} rows, 5 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          <a
            href="/templates/authorloft-courses-import-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            Download the AuthorLoft courses CSV template
          </a>
        </div>
      )}

      {/* ── Step 2: Map Columns ── */}
      {step === "map" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>{fileName}</strong> — {rawRows.length} row{rawRows.length === 1 ? "" : "s"} (one row per lesson).
              We've guessed a mapping based on your column names — adjust as needed.
            </span>
          </div>
          {parseWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{parseWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COURSE_LESSON_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {field.label}{field.required && <span className="text-red-500"> *</span>}
                  {field.hint && <span className="text-gray-400 font-normal"> — {field.hint}</span>}
                </label>
                <select
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => setFieldMapping(field.key, e.target.value)}
                  className={selectClass}
                >
                  <option value="">— Not mapped —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {mapError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{mapError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={startOver}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Start over
            </Button>
            <Button type="button" onClick={proceedToPreview}>
              Next: Preview <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ── */}
      {step === "preview" && (
        <div className="space-y-5">
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>{importCount}</strong> course{importCount === 1 ? "" : "s"} ({totalModules} module{totalModules === 1 ? "" : "s"},{" "}
              {totalLessons} lesson{totalLessons === 1 ? "" : "s"}) ready to import as drafts. You can review and publish
              each one afterward.
            </span>
          </div>

          {skippedRowCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{skippedRowCount} row{skippedRowCount === 1 ? "" : "s"} skipped — missing a course or lesson title.</span>
            </div>
          )}

          {lessonsMissingContent > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {lessonsMissingContent} lesson{lessonsMissingContent === 1 ? "" : "s"} {lessonsMissingContent === 1 ? "has" : "have"} no content or video URL —
                they'll still be imported, empty, for you to fill in later.
              </span>
            </div>
          )}

          {skippedForLimit > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Your <strong>{planTier}</strong> plan allows {maxCourses === null ? "unlimited" : `up to ${maxCourses}`} courses.
                The first <strong>{importCount}</strong> course{importCount === 1 ? "" : "s"} will be imported —{" "}
                <strong>{skippedForLimit}</strong> will be skipped.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to import more.
              </span>
            </div>
          )}

          {/* Nested course/module/lesson tree */}
          <div className="max-h-[28rem] overflow-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
            {courses.map((course, i) => {
              const skipped = i >= importCount;
              const isCollapsed = collapsed.has(i);
              const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
              return (
                <div key={i} className={skipped ? "opacity-40" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(i)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50"
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-sm truncate">{course.title}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {course.modules.length} module{course.modules.length === 1 ? "" : "s"} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                    </span>
                    {skipped && <Badge variant="outline" className="ml-auto flex-shrink-0">Skipped — plan limit</Badge>}
                  </button>
                  {!isCollapsed && (
                    <div className="pb-2 pl-9 pr-3 space-y-2">
                      {course.categoryNames.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {course.categoryNames.map((name) => (
                            <Badge key={name} variant="outline" className="text-[10px] py-0">{name}</Badge>
                          ))}
                        </div>
                      )}
                      {course.modules.map((module, mi) => (
                        <div key={mi}>
                          <p className="text-xs font-semibold text-gray-500 mb-1">{module.title}</p>
                          <ul className="space-y-0.5">
                            {module.lessons.map((lesson, li) => (
                              <li key={li} className="text-xs text-gray-600 flex items-center gap-1.5">
                                <span className="truncate">{lesson.title}</span>
                                {!lesson.contentHtml && !lesson.videoUrl && (
                                  <Badge variant="outline" className="text-[10px] py-0">empty</Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {importError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => setStep("map")} disabled={importing}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing || importCount === 0}>
              {importing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing…</>
                : `Import ${importCount} Course${importCount === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Results ── */}
      {step === "results" && result && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                Imported {result.imported} course{result.imported === 1 ? "" : "s"} as draft{result.imported === 1 ? "" : "s"}.
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Review each one in My Courses, add a cover/pricing if needed, then publish when ready.
              </p>
            </div>
          </div>

          {result.skippedForPlanLimit > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {result.skippedForPlanLimit} course{result.skippedForPlanLimit === 1 ? "" : "s"} skipped — your{" "}
                <strong>{planTier}</strong> plan limit was reached.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> and re-import the
                remaining rows.
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
              <RotateCcw className="h-4 w-4 mr-2" /> Import another file
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
