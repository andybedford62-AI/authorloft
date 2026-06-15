"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  UploadCloud, FileText, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  AlertTriangle, Sparkles, Download, RotateCcw, Save, BookmarkPlus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BOOK_FIELDS, type BookFieldKey, type ColumnMapping, type DetectedPreset,
  type MappedBookRow, detectMapping, mapRow,
  MAX_IMPORT_ROWS, MAX_IMPORT_FILE_SIZE_BYTES,
} from "@/lib/csv-import";
import {
  loadPresets, savePreset, deletePreset, type MappingPreset,
} from "@/lib/csv-import-presets";
import { lookupByIsbn } from "@/lib/isbn-lookup";

type Step = "upload" | "map" | "preview" | "results";

type ImportResult = {
  imported: number;
  skippedForPlanLimit: number;
  warnings: string[];
};

interface Props {
  existingGenres: string[];
  existingSeries: string[];
  remainingSlots: number | null; // null = unlimited
  maxBooks: number | null;
  planTier: string;
}

const selectClass =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function BookImportWizard({ existingGenres, existingSeries, remainingSlots, maxBooks, planTier }: Props) {
  const [step, setStep] = useState<Step>("upload");

  // Upload
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [preset, setPreset] = useState<DetectedPreset>("generic");
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [parseError, setParseError] = useState("");
  const [parseWarning, setParseWarning] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Map
  const [mapError, setMapError] = useState("");

  // Saved mapping presets (browser-local)
  const [presets, setPresets] = useState<MappingPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [presetMsg, setPresetMsg] = useState("");
  useEffect(() => { setPresets(loadPresets()); }, []);

  function applyPreset(name: string) {
    if (!name) return;
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    // Only keep mappings whose column actually exists in this file's headers.
    const next: ColumnMapping = {};
    for (const [field, header] of Object.entries(preset.mapping)) {
      if (header && headers.includes(header)) next[field as BookFieldKey] = header;
    }
    setMapping(next);
    setMapError("");
    setPresetMsg(`Applied "${name}" — adjust any unmatched columns below.`);
  }

  function handleSavePreset() {
    const name = presetName.trim();
    if (!name) { setPresetMsg("Enter a name for this preset."); return; }
    if (Object.keys(mapping).length === 0) { setPresetMsg("Map at least one column before saving."); return; }
    setPresets(savePreset(name, mapping));
    setPresetName("");
    setPresetMsg(`Saved "${name}".`);
  }

  function handleDeletePreset(name: string) {
    setPresets(deletePreset(name));
    setPresetMsg(`Deleted "${name}".`);
  }

  // Preview
  const [mappedRows, setMappedRows] = useState<MappedBookRow[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ done: 0, total: 0 });
  const [enriched, setEnriched] = useState(false);

  // Import / results
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const existingGenreSet  = new Set(existingGenres.map((g) => g.toLowerCase()));
  const existingSeriesSet = new Set(existingSeries.map((s) => s.toLowerCase()));

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

        const { preset: detectedPreset, mapping: detectedMapping } = detectMapping(fields);
        setHeaders(fields);
        setRawRows(rows);
        setPreset(detectedPreset);
        setMapping(detectedMapping);
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
  function setFieldMapping(field: BookFieldKey, header: string) {
    setMapping((prev) => {
      const next = { ...prev };
      if (header) next[field] = header;
      else delete next[field];
      return next;
    });
    setMapError("");
  }

  function proceedToPreview() {
    if (!mapping.title) {
      setMapError("Map a column to Title before continuing — it's the only required field.");
      return;
    }
    const rows = rawRows.map((r) => mapRow(r, mapping, preset));
    setMappedRows(rows);
    setEnriched(false);
    setStep("preview");
  }

  // ── Step 3: Preview ─────────────────────────────────────────────────────
  const validRows         = mappedRows.filter((r) => r.title.trim() !== "");
  const missingTitleCount = mappedRows.length - validRows.length;
  const importCount       = remainingSlots === null ? validRows.length : Math.min(validRows.length, remainingSlots);
  const skippedForLimit   = validRows.length - importCount;
  const enrichCandidates  = validRows.filter((r) => r.isbn && (!r.description || !r.coverImageUrl));

  async function enrichFromIsbn() {
    setEnriching(true);
    setEnrichProgress({ done: 0, total: enrichCandidates.length });

    const updated = mappedRows.map((r) => ({ ...r }));
    const targets = updated
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.title.trim() !== "" && r.isbn && (!r.description || !r.coverImageUrl));

    for (let idx = 0; idx < targets.length; idx++) {
      const { r, i } = targets[idx];
      try {
        const found = await lookupByIsbn(r.isbn!);
        if (found) {
          updated[i] = {
            ...updated[i],
            description:   updated[i].description   || found.description || updated[i].description,
            coverImageUrl: updated[i].coverImageUrl  || found.coverUrl    || updated[i].coverImageUrl,
            subtitle:      updated[i].subtitle       || found.subtitle    || updated[i].subtitle,
            pageCount:     updated[i].pageCount      ?? found.pageCount,
          };
        }
      } catch {
        // skip this row, continue with the rest
      }
      setEnrichProgress({ done: idx + 1, total: targets.length });
      await new Promise((res) => setTimeout(res, 250)); // gentle rate limit
    }

    setMappedRows(updated);
    setEnriched(true);
    setEnriching(false);
  }

  // ── Step 4: Import ───────────────────────────────────────────────────────
  async function handleImport() {
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch("/api/admin/books/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rows: validRows }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Import failed.");
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
    setMappedRows([]);
    setParseError("");
    setParseWarning("");
    setMapError("");
    setImportError("");
    setEnriched(false);
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
            <p className="text-xs text-gray-400">Goodreads "Export Library" CSV or the AuthorLoft template — up to {MAX_IMPORT_ROWS} rows, 5 MB</p>
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
            href="/templates/authorloft-books-import-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            Download the AuthorLoft CSV template
          </a>
        </div>
      )}

      {/* ── Step 2: Map Columns ── */}
      {step === "map" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>{fileName}</strong> — {rawRows.length} row{rawRows.length === 1 ? "" : "s"}.{" "}
              {preset === "goodreads"
                ? "We detected a Goodreads export and pre-mapped the columns below."
                : "We've guessed a mapping based on your column names — adjust as needed."}
            </span>
          </div>
          {parseWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{parseWarning}</span>
            </div>
          )}

          {/* Saved mapping presets (browser-local) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <BookmarkPlus className="h-3.5 w-3.5" /> Saved mappings
              <span className="font-normal text-gray-400">— reuse a mapping for another CSV from the same source (saved in this browser)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              {presets.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <select
                    defaultValue=""
                    onChange={(e) => { applyPreset(e.target.value); e.target.value = ""; }}
                    className={selectClass + " sm:w-56"}
                    aria-label="Load a saved mapping"
                  >
                    <option value="">Load a saved mapping…</option>
                    {presets.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Name this mapping…"
                  maxLength={40}
                  className={selectClass + " flex-1"}
                />
                <Button type="button" size="sm" variant="outline" onClick={handleSavePreset}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
              </div>
            </div>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 pl-2.5 pr-1 py-0.5 text-xs text-gray-600">
                    {p.name}
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(p.name)}
                      className="rounded-full p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {presetMsg && <p className="text-xs text-gray-500">{presetMsg}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BOOK_FIELDS.map((field) => (
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
              <strong>{importCount}</strong> book{importCount === 1 ? "" : "s"} ready to import as drafts. You can review
              and publish each one afterward.
            </span>
          </div>

          {missingTitleCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{missingTitleCount} row{missingTitleCount === 1 ? "" : "s"} skipped — no title found.</span>
            </div>
          )}

          {skippedForLimit > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Your <strong>{planTier}</strong> plan allows {maxBooks === null ? "unlimited" : `up to ${maxBooks}`} books.
                The first <strong>{importCount}</strong> row{importCount === 1 ? "" : "s"} will be imported —{" "}
                <strong>{skippedForLimit}</strong> will be skipped.{" "}
                <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link> to import more.
              </span>
            </div>
          )}

          {/* ISBN enrichment */}
          {enrichCandidates.length > 0 && !enriched && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-800">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                {enrichCandidates.length} row{enrichCandidates.length === 1 ? "" : "s"} have an ISBN but are missing a
                description or cover. We can look these up automatically.
              </span>
              <Button type="button" size="sm" variant="outline" onClick={enrichFromIsbn} disabled={enriching}>
                {enriching
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Looking up {enrichProgress.done}/{enrichProgress.total}…</>
                  : "Fill missing details from ISBN"}
              </Button>
            </div>
          )}
          {enriched && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Lookup complete — covers and descriptions filled in where we found a match.
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-auto max-h-[28rem] rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Cover</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Title</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">ISBN</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Genres</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Series</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Release Date</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Formats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validRows.map((row, i) => {
                  const skipped = i >= importCount;
                  return (
                    <tr key={i} className={skipped ? "opacity-40" : ""}>
                      <td className="px-3 py-2">
                        {row.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.coverImageUrl} alt="" className="h-12 w-9 object-cover rounded border border-gray-200" />
                        ) : (
                          <div className="h-12 w-9 rounded border border-dashed border-gray-200 bg-gray-50" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-900">{row.title}</p>
                        {row.subtitle && <p className="text-xs text-gray-400">{row.subtitle}</p>}
                      </td>
                      <td className="px-3 py-2 text-gray-500 font-mono text-xs">{row.isbn ?? "—"}</td>
                      <td className="px-3 py-2">
                        {row.genreNames.length === 0 ? "—" : row.genreNames.map((g) => (
                          <Badge key={g} variant={existingGenreSet.has(g.toLowerCase()) ? "outline" : "success"} className="mr-1 mb-1">
                            {g}{!existingGenreSet.has(g.toLowerCase()) && " (new)"}
                          </Badge>
                        ))}
                      </td>
                      <td className="px-3 py-2">
                        {row.seriesName ? (
                          <Badge variant={existingSeriesSet.has(row.seriesName.toLowerCase()) ? "outline" : "success"}>
                            {row.seriesName}{!existingSeriesSet.has(row.seriesName.toLowerCase()) && " (new)"}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.releaseDate ?? "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{row.availableFormats.join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {importError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => setStep("map")} disabled={importing || enriching}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing || enriching || importCount === 0}>
              {importing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing…</>
                : `Import ${importCount} Book${importCount === 1 ? "" : "s"}`}
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
                Imported {result.imported} book{result.imported === 1 ? "" : "s"} as draft{result.imported === 1 ? "" : "s"}.
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Review each one in My Books, add a cover/description if needed, then publish when ready.
              </p>
            </div>
          </div>

          {result.skippedForPlanLimit > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {result.skippedForPlanLimit} book{result.skippedForPlanLimit === 1 ? "" : "s"} skipped — your{" "}
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
            <Link href="/admin/books">
              <Button type="button">Go to My Books</Button>
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
