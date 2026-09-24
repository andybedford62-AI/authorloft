"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Video, Eye, HelpCircle, Paperclip, Store, Lock, BookText, Link2, Megaphone, CheckCircle2, Star, FileText, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverUpload } from "@/components/admin/cover-upload";
import { CourseHelpModal } from "@/components/admin/course-help-modal";
import { HelpTip } from "@/components/admin/help-tip";
import { CollapsibleCard } from "@/components/admin/collapsible-card";

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 border border-gray-200 rounded-lg bg-gray-50 animate-pulse" /> }
);

interface LessonData {
  /** Client-only key for the lesson's open/closed state; never sent to the API. */
  uid?: string;
  title: string;
  contentHtml: string;
  videoUrl: string;
  isPreview: boolean;
  fileKey: string;
  fileName: string;
}

interface ModuleData {
  title: string;
  description: string;
  lessons: LessonData[];
}

export type CourseSubcategoryOption = { id: string; name: string };
export type CourseCategoryOption = { id: string; name: string; children: CourseSubcategoryOption[] };

export interface CourseData {
  id?: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  priceCents: number;
  isPublished: boolean;
  allowDownload: boolean;
  isFeatured: boolean;
  listInBookstore: boolean;
  workbookFileKey: string | null;
  workbookFileName: string | null;
  workbookUrl: string | null;
  courseAnnouncedAt: string | null;
  /** `YYYY-MM-DD`, shown as "Published <date>" on the public course page. */
  releaseDate: string | null;
  categoryIds: string[];
  modules: ModuleData[];
}

interface CourseFormProps {
  initial?: Partial<CourseData>;
  mode: "create" | "edit";
  bookstoreEnabled?: boolean;
  categories?: CourseCategoryOption[];
}

let lessonSeq = 0;
const nextLessonUid = () => `lesson-${++lessonSeq}`;

function emptyLesson(): LessonData {
  return { uid: nextLessonUid(), title: "", contentHtml: "", videoUrl: "", isPreview: false, fileKey: "", fileName: "" };
}

function emptyModule(): ModuleData {
  return { title: "", description: "", lessons: [emptyLesson()] };
}

/** Given the flat list of assigned category IDs (may include a parent, a
 *  child, or both — see how the picker below saves), figure out which
 *  dropdown selections they represent. */
function deriveCategorySelection(categoryIds: string[], categories: CourseCategoryOption[]) {
  for (const cat of categories) {
    const child = cat.children.find((c) => categoryIds.includes(c.id));
    if (child) return { categoryId: cat.id, subcategoryId: child.id };
    if (categoryIds.includes(cat.id)) return { categoryId: cat.id, subcategoryId: "" };
  }
  return { categoryId: "", subcategoryId: "" };
}

function LessonFileAttachment({
  fileKey,
  fileName,
  onChange,
}: {
  fileKey: string;
  fileName: string;
  onChange: (patch: { fileKey: string; fileName: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/course-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange({ fileKey: data.fileKey, fileName: data.fileName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="pl-8">
      <div className="flex items-center gap-2">
        <Paperclip className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        {fileKey ? (
          <div className="flex-1 flex items-center gap-2 text-xs">
            <span className="text-gray-600 truncate">{fileName || "Attached file"}</span>
            <button
              type="button"
              onClick={() => onChange({ fileKey: "", fileName: "" })}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove attachment"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {uploading ? "Uploading…" : "Attach a downloadable file (worksheet, slides, etc.)"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1 pl-5">{error}</p>}
    </div>
  );
}

function WorkbookUpload({
  fileKey,
  fileName,
  url,
  onChange,
}: {
  fileKey: string;
  fileName: string;
  url: string;
  onChange: (patch: { fileKey: string; fileName: string; url: string }) => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">(url ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/course-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange({ fileKey: data.fileKey, fileName: data.fileName, url: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
        <BookText className="h-4 w-4 text-gray-400" /> Course Workbook
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Optional PDF or DOCX workbook. Readers can only download it after enrolling — same as the
        full-course download.
      </p>

      {fileKey || url ? (
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
          {fileKey ? <Paperclip className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" /> : <Link2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
          <span className="flex-1 truncate text-gray-700">{fileKey ? (fileName || "Uploaded workbook") : url}</span>
          <button
            type="button"
            onClick={() => onChange({ fileKey: "", fileName: "", url: "" })}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove workbook"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-3 py-1 rounded-md transition-colors ${tab === "upload" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`px-3 py-1 rounded-md transition-colors ${tab === "url" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}
            >
              Link to a URL
            </button>
          </div>

          {tab === "upload" ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-3 text-sm text-blue-600 hover:text-blue-800 hover:border-gray-400 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Choose a PDF or DOCX file"}
            </button>
          ) : (
            <input
              type="url"
              placeholder="https://example.com/workbook.pdf"
              onBlur={(e) => {
                if (e.target.value.trim()) onChange({ fileKey: "", fileName: "", url: e.target.value.trim() });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/** Today in the author's own timezone, as `YYYY-MM-DD` for a date input. */
function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CourseForm({ initial, mode, bookstoreEnabled = false, categories = [] }: CourseFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial?.priceCents ? (initial.priceCents / 100).toFixed(2) : ""
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [allowDownload, setAllowDownload] = useState(initial?.allowDownload ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [listInBookstore, setListInBookstore] = useState(initial?.listInBookstore ?? false);
  const [workbookFileKey, setWorkbookFileKey] = useState(initial?.workbookFileKey ?? "");
  const [workbookFileName, setWorkbookFileName] = useState(initial?.workbookFileName ?? "");
  const [workbookUrl, setWorkbookUrl] = useState(initial?.workbookUrl ?? "");
  // A new course starts with today's date so it gets one without anyone
  // thinking about it; existing courses keep whatever they have (often blank).
  const [releaseDate, setReleaseDate] = useState(
    initial?.releaseDate ?? (mode === "create" ? todayLocalDate() : "")
  );
  const initialSelection = deriveCategorySelection(initial?.categoryIds ?? [], categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSelection.categoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(initialSelection.subcategoryId);
  const [modules, setModules] = useState<ModuleData[]>(() =>
    initial?.modules?.length
      ? initial.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l, uid: nextLessonUid() })) }))
      : [emptyModule()]
  );
  // A new course opens everything so you can type straight in; an existing one
  // opens collapsed (like the music track list) so it's scannable, not 12 screens.
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() =>
    mode === "create" ? new Set(modules.map((_, i) => i)) : new Set()
  );
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(() =>
    mode === "create" ? new Set(modules.flatMap((m) => m.lessons.map((l) => l.uid!))) : new Set()
  );
  const [openSections, setOpenSections] = useState({
    details: true,
    curriculum: true,
    workbook: false,
    visibility: mode === "create",
  });
  const toggleSection = (k: keyof typeof openSections) => setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  const [showHelp, setShowHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [announcing, setAnnouncing] = useState(false);
  const [announceError, setAnnounceError] = useState("");
  const [announceResult, setAnnounceResult] = useState<{ sent: number; total: number } | null>(null);
  const [courseAnnouncedAt, setCourseAnnouncedAt] = useState(initial?.courseAnnouncedAt ?? null);

  const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);

  // "Unsaved changes" on the save bar: compare everything saveable with how it loaded.
  const snapshot = useMemo(
    () => JSON.stringify({
      title, description, coverImageUrl, priceDollars, isPublished, allowDownload, isFeatured,
      listInBookstore, workbookFileKey, workbookFileName, workbookUrl, releaseDate,
      selectedCategoryId, selectedSubcategoryId,
      modules: modules.map((m) => ({ ...m, lessons: m.lessons.map(({ uid: _uid, ...l }) => l) })),
    }),
    [title, description, coverImageUrl, priceDollars, isPublished, allowDownload, isFeatured,
      listInBookstore, workbookFileKey, workbookFileName, workbookUrl, releaseDate,
      selectedCategoryId, selectedSubcategoryId, modules]
  );
  const loadedSnapshot = useRef(snapshot);
  const isDirty = snapshot !== loadedSnapshot.current;

  function toggleLesson(uid: string) {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function expandAll() {
    setExpandedModules(new Set(modules.map((_, i) => i)));
    setExpandedLessons(new Set(modules.flatMap((m) => m.lessons.map((l) => l.uid!))));
  }

  function collapseAll() {
    setExpandedModules(new Set());
    setExpandedLessons(new Set());
  }
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  function handleCategoryChange(id: string) {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(""); // subcategory options change with the parent — reset
  }

  const subcategoryOptions = categories.find((c) => c.id === selectedCategoryId)?.children ?? [];

  function toggleModuleExpanded(idx: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function updateModule(idx: number, patch: Partial<ModuleData>) {
    setModules((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  function removeModule(idx: number) {
    if (modules.length <= 1) return;
    setModules((prev) => prev.filter((_, i) => i !== idx));
    setExpandedModules((prev) => {
      const next = new Set<number>();
      for (const v of prev) {
        if (v < idx) next.add(v);
        else if (v > idx) next.add(v - 1);
      }
      return next;
    });
  }

  function addModule() {
    const mod = emptyModule();
    setModules((prev) => [...prev, mod]);
    setExpandedModules((prev) => new Set([...prev, modules.length]));
    setExpandedLessons((prev) => new Set([...prev, ...mod.lessons.map((l) => l.uid!)]));
  }

  function updateLesson(modIdx: number, lesIdx: number, patch: Partial<LessonData>) {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === modIdx
          ? { ...m, lessons: m.lessons.map((l, li) => (li === lesIdx ? { ...l, ...patch } : l)) }
          : m
      )
    );
  }

  function removeLesson(modIdx: number, lesIdx: number) {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === modIdx ? { ...m, lessons: m.lessons.filter((_, li) => li !== lesIdx) } : m
      )
    );
  }

  function addLesson(modIdx: number) {
    const lesson = emptyLesson();
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === modIdx ? { ...m, lessons: [...m.lessons, lesson] } : m
      )
    );
    setExpandedLessons((prev) => new Set([...prev, lesson.uid!]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nonEmptyModules = modules.filter((m) => m.title.trim() || m.lessons.some((l) => l.title.trim()));
    if (nonEmptyModules.length === 0) {
      setError("Add at least one module with a title");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        priceCents,
        isPublished,
        allowDownload,
        isFeatured,
        listInBookstore,
        workbookFileKey: workbookFileKey || null,
        workbookFileName: workbookFileName || null,
        workbookUrl: workbookUrl || null,
        releaseDate,
        categoryIds: selectedCategoryId
          ? (selectedSubcategoryId ? [selectedCategoryId, selectedSubcategoryId] : [selectedCategoryId])
          : [],
        modules: nonEmptyModules.map((m) => ({
          title: m.title.trim(),
          description: m.description.trim() || null,
          lessons: m.lessons
            .filter((l) => l.title.trim())
            .map((l) => ({
              title: l.title.trim(),
              contentHtml: l.contentHtml || null,
              videoUrl: l.videoUrl.trim() || null,
              isPreview: l.isPreview,
              fileKey: l.fileKey || null,
              fileName: l.fileName || null,
            })),
        })),
      };

      const url = mode === "edit" ? `/api/admin/courses/${initial?.id}` : "/api/admin/courses";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }

      router.push("/admin/courses");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleAnnounce() {
    if (!initial?.id) return;
    if (!confirm("Email everyone who opted in to course announcements about this course? This can't be undone.")) return;
    setAnnouncing(true);
    setAnnounceError("");
    try {
      const res = await fetch(`/api/admin/courses/${initial.id}/announce`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAnnounceError(data.error ?? "Failed to send announcement");
        return;
      }
      setAnnounceResult({ sent: data.sent, total: data.total });
      setCourseAnnouncedAt(new Date().toISOString());
    } catch {
      setAnnounceError("Something went wrong");
    } finally {
      setAnnouncing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this course and all its modules/lessons? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${initial?.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete");
        return;
      }
      router.push("/admin/courses");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CourseHelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        How courses work
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <CollapsibleCard
        title="Course details"
        summary={[title || "Untitled", priceCents > 0 ? `${(priceCents / 100).toFixed(2)}` : "Free"].join(" · ")}
        open={openSections.details}
        onToggle={() => toggleSection("details")}
      >
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write Your First Novel in 30 Days"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What will students learn in this course?"
        />
      </div>

      {/* Cover Image */}
      <CoverUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Course Cover Image" />

      {/* Price + Published date — side by side from sm up, stacked on phones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00 (free)"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Set to $0 for a free course</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Published date <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Shown on your public course page. Leave blank to hide it.</p>
        </div>
      </div>

      {/* Category / Subcategory — optional, linked dropdowns */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Optional</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(e.target.value)}
              disabled={!selectedCategoryId || subcategoryOptions.length === 0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— None —</option>
              {subcategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {selectedCategoryId
                ? (subcategoryOptions.length === 0 ? "No subcategories for this category" : "Optional")
                : "Choose a category first"}
            </p>
          </div>
        </div>
      )}

      </CollapsibleCard>

      {/* Modules & Lessons */}
      <CollapsibleCard
        title="Curriculum"
        summary={`${modules.length} module${modules.length !== 1 ? "s" : ""}, ${totalLessons} lesson${totalLessons !== 1 ? "s" : ""}`}
        open={openSections.curriculum}
        onToggle={() => toggleSection("curriculum")}
        actions={<HelpTip id="course-first" />}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            {modules.length} module{modules.length !== 1 ? "s" : ""}, {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}. Open a module, then a lesson, to edit it.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={expandAll} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
              <ChevronsUpDown className="h-3.5 w-3.5" /> Expand all
            </button>
            <button type="button" onClick={collapseAll} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
              <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse all
            </button>
            <Button type="button" variant="outline" size="sm" onClick={addModule}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Module
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((mod, mi) => {
            const isExpanded = expandedModules.has(mi);
            return (
              <div key={mi} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Module header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <button type="button" onClick={() => toggleModuleExpanded(mi)} className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Module {mi + 1}</span>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModule(mi, { title: e.target.value })}
                    className="flex-1 bg-transparent border-0 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 px-2"
                    placeholder="Module title..."
                  />
                  <span className="text-xs text-gray-400">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</span>
                  {modules.length > 1 && (
                    <button type="button" onClick={() => removeModule(mi)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Module description */}
                    <input
                      type="text"
                      value={mod.description}
                      onChange={(e) => updateModule(mi, { description: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Module description (optional)"
                    />

                    {/* Lessons */}
                    <div className="space-y-2">
                      {mod.lessons.map((les, li) => {
                        const lessonOpen = expandedLessons.has(les.uid!);
                        const hasText = !!les.contentHtml.replace(/<[^>]+>/g, "").trim();
                        return (
                        <div key={les.uid ?? li} className={`border rounded-lg bg-white ${lessonOpen ? "border-gray-200 p-3 space-y-2" : "border-gray-100 px-3 py-2"}`}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLesson(les.uid!)}
                              aria-expanded={lessonOpen}
                              aria-label={lessonOpen ? "Collapse lesson" : "Edit lesson"}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {lessonOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            <span className="text-xs text-gray-400 w-5 text-center">{li + 1}.</span>
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                              className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Lesson title"
                            />
                            {!lessonOpen && (
                              <span className="hidden sm:flex items-center gap-1.5 text-gray-400" aria-hidden="true">
                                {les.videoUrl.trim() && <Video className="h-3.5 w-3.5" />}
                                {hasText && <FileText className="h-3.5 w-3.5" />}
                                {les.fileKey && <Paperclip className="h-3.5 w-3.5" />}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => updateLesson(mi, li, { isPreview: !les.isPreview })}
                              className={`p-1.5 rounded transition-colors ${les.isPreview ? "text-green-600 bg-green-50" : "text-gray-300 hover:text-gray-500"}`}
                              title={les.isPreview ? "Free preview (click to disable)" : "Make free preview"}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {mod.lessons.length > 1 && (
                              <button type="button" onClick={() => removeLesson(mi, li)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {lessonOpen && (<>
                          <div className="flex items-center gap-2 pl-8">
                            <Video className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <input
                              type="url"
                              value={les.videoUrl}
                              onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value })}
                              className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Video URL (YouTube/Vimeo — optional)"
                            />
                          </div>
                          <div className="pl-8">
                            <RichTextEditor
                              value={les.contentHtml}
                              onChange={(html) => updateLesson(mi, li, { contentHtml: html })}
                              placeholder="Lesson content…"
                              minHeight="140px"
                            />
                          </div>
                          <LessonFileAttachment
                            fileKey={les.fileKey}
                            fileName={les.fileName}
                            onChange={(patch) => updateLesson(mi, li, patch)}
                          />
                          </>)}
                        </div>
                        );
                      })}
                    </div>

                    <Button type="button" variant="ghost" size="sm" onClick={() => addLesson(mi)} className="text-gray-500">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleCard>

      {/* Course Workbook */}
      <CollapsibleCard
        title="Workbook"
        summary={workbookFileName || (workbookUrl ? "Linked" : "None")}
        open={openSections.workbook}
        onToggle={() => toggleSection("workbook")}
      >
      <WorkbookUpload
        fileKey={workbookFileKey}
        fileName={workbookFileName}
        url={workbookUrl}
        onChange={(patch) => {
          setWorkbookFileKey(patch.fileKey);
          setWorkbookFileName(patch.fileName);
          setWorkbookUrl(patch.url);
        }}
      />
      </CollapsibleCard>

      <CollapsibleCard
        title="Visibility & publishing"
        summary={[
          isPublished ? "Published" : "Draft",
          isFeatured && "Featured",
          allowDownload && "Downloadable",
          listInBookstore && "In Bookstore",
        ].filter(Boolean).join(" · ")}
        open={openSections.visibility}
        onToggle={() => toggleSection("visibility")}
      >
      {/* Published */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Published (visible on your site)
        </label>
      </div>

      {/* Featured — the hero highlight when the author's homepage focus is set to Courses/Music */}
      <div className="flex items-center gap-4 cursor-pointer select-none" onClick={() => setIsFeatured((v) => !v)}>
        <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${isFeatured ? "bg-amber-500" : "bg-gray-300"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? "translate-x-5" : "translate-x-1"}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Featured
          </p>
          <p className="text-xs text-gray-400">
            Shown as the hero highlight when your homepage focus is set to Courses.
          </p>
        </div>
      </div>

      {/* Announce to subscribers — edit mode only, once the saved course is published */}
      {mode === "edit" && initial?.isPublished && (
        <div className="rounded-lg border border-gray-200 px-4 py-3.5">
          {courseAnnouncedAt ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              Announced to subscribers on {new Date(courseAnnouncedAt).toLocaleDateString()}
              {announceResult && ` — sent to ${announceResult.sent} of ${announceResult.total} subscribers`}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-gray-400" />
                  Announce this course
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Email subscribers who opted in to hear about new courses. One-time send — editing or re-saving this course afterward won&apos;t trigger another.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAnnounce} disabled={announcing} className="flex-shrink-0">
                {announcing && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Announce to Subscribers
              </Button>
            </div>
          )}
          {announceError && <p className="text-xs text-red-600 mt-2">{announceError}</p>}
        </div>
      )}

      {/* Allow download/print */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowDownload"
          checked={allowDownload}
          onChange={(e) => setAllowDownload(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="allowDownload" className="text-sm text-gray-700">
          Let readers print or download the full course (readers still need access to a lesson to see it)
        </label>
      </div>

      {/* AuthorLoft Bookstore opt-in — edit mode only (new courses redirect to edit) */}
      {mode === "edit" && (
        <div className="pt-2 border-t border-gray-100">
          {bookstoreEnabled ? (
            <>
              <div className="flex items-center gap-4 cursor-pointer select-none"
                onClick={() => setListInBookstore((v) => !v)}>
                <div className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${listInBookstore ? "bg-emerald-600" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${listInBookstore ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-emerald-600" />
                    List in AuthorLoft Bookstore
                  </p>
                  <p className="text-xs text-gray-400">
                    Feature this course in the public AuthorLoft Bookstore for cross-discovery. Readers click through to this course on your own site — no payment is taken there.
                  </p>
                </div>
              </div>
              {listInBookstore && (
                <div className="ml-14 mt-2 rounded-lg p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700">
                  Listed once this course is <strong>Published</strong>. Make sure it has a cover image and description so it looks its best in the catalog.
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
              <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <span className="font-semibold">The AuthorLoft Bookstore requires a Standard plan or higher.</span>{" "}
                <a href="/admin/settings#billing" className="underline hover:text-amber-900">Upgrade your plan</a> to list your courses in the public bookstore for extra discovery.
              </div>
            </div>
          )}
        </div>
      )}

      </CollapsibleCard>

      {/* Actions — sticky to the bottom of the viewport so long courses (lots of
          modules/lessons) don't require scrolling all the way down to save. */}
      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 flex items-center gap-3 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_6px_-4px_rgba(0,0,0,0.08)]">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
          Cancel
        </Button>
        {isDirty && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" /> Unsaved changes
          </span>
        )}
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
