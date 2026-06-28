"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Video, Eye, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverUpload } from "@/components/admin/cover-upload";
import { CourseHelpModal } from "@/components/admin/course-help-modal";

interface LessonData {
  title: string;
  contentHtml: string;
  videoUrl: string;
  isPreview: boolean;
}

interface ModuleData {
  title: string;
  description: string;
  lessons: LessonData[];
}

export interface CourseData {
  id?: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  priceCents: number;
  isPublished: boolean;
  modules: ModuleData[];
}

interface CourseFormProps {
  initial?: Partial<CourseData>;
  mode: "create" | "edit";
}

function emptyLesson(): LessonData {
  return { title: "", contentHtml: "", videoUrl: "", isPreview: false };
}

function emptyModule(): ModuleData {
  return { title: "", description: "", lessons: [emptyLesson()] };
}

export function CourseForm({ initial, mode }: CourseFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial?.priceCents ? (initial.priceCents / 100).toFixed(2) : ""
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [modules, setModules] = useState<ModuleData[]>(
    initial?.modules?.length ? initial.modules : [emptyModule()]
  );
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(modules.map((_, i) => i))
  );

  const [showHelp, setShowHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

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
    setModules((prev) => [...prev, emptyModule()]);
    setExpandedModules((prev) => new Set([...prev, modules.length]));
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
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === modIdx ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m
      )
    );
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Price */}
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

      {/* Modules & Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Curriculum ({modules.length} module{modules.length !== 1 ? "s" : ""}, {totalLessons} lesson{totalLessons !== 1 ? "s" : ""})
          </label>
          <Button type="button" variant="outline" size="sm" onClick={addModule}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Module
          </Button>
        </div>

        <div className="space-y-4">
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
                  <div className="p-4 space-y-4">
                    {/* Module description */}
                    <input
                      type="text"
                      value={mod.description}
                      onChange={(e) => updateModule(mi, { description: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Module description (optional)"
                    />

                    {/* Lessons */}
                    <div className="space-y-3">
                      {mod.lessons.map((les, li) => (
                        <div key={li} className="border border-gray-100 rounded-lg p-3 bg-white space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-6 text-center">{li + 1}.</span>
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                              className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Lesson title"
                            />
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
                            <textarea
                              value={les.contentHtml}
                              onChange={(e) => updateLesson(mi, li, { contentHtml: e.target.value })}
                              rows={2}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Lesson content (HTML supported)..."
                            />
                          </div>
                        </div>
                      ))}
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
      </div>

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

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
          Cancel
        </Button>
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
