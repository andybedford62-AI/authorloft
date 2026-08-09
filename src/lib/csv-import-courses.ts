// Column-mapping and row-grouping for the Courses CSV import wizard.
// A course is a 3-level tree (Course -> Module -> Lesson), so the CSV is
// one row per lesson, with Course Title / Module Title repeated across rows
// to signal grouping. See src/lib/csv-import.ts for the (flat) Books version.

import { MAX_IMPORT_ROWS, MAX_IMPORT_FILE_SIZE_BYTES } from "@/lib/csv-import";

export { MAX_IMPORT_ROWS, MAX_IMPORT_FILE_SIZE_BYTES };

export type CourseLessonFieldKey =
  | "courseTitle"
  | "courseDescription"
  | "moduleTitle"
  | "moduleOrder"
  | "lessonTitle"
  | "lessonContent"
  | "videoUrl"
  | "isPreview";

export const COURSE_LESSON_FIELDS: { key: CourseLessonFieldKey; label: string; required?: boolean; hint?: string }[] = [
  { key: "courseTitle",       label: "Course Title",       required: true },
  { key: "courseDescription", label: "Course Description" },
  { key: "moduleTitle",       label: "Module Title",       hint: "Defaults to \"Module 1\", \"Module 2\"… if blank" },
  { key: "moduleOrder",       label: "Module Order" },
  { key: "lessonTitle",       label: "Lesson Title",       required: true },
  { key: "lessonContent",     label: "Lesson Content" },
  { key: "videoUrl",          label: "Video URL" },
  { key: "isPreview",         label: "Free Preview",       hint: "TRUE/FALSE" },
];

/** Maps a course/lesson field to the CSV header that supplies it (or unmapped). */
export type CourseColumnMapping = Partial<Record<CourseLessonFieldKey, string>>;

// ── Auto-detection ───────────────────────────────────────────────────────────

const FIELD_ALIASES: Record<CourseLessonFieldKey, string[]> = {
  courseTitle:       ["course title", "course name", "course"],
  courseDescription: ["course description", "description"],
  moduleTitle:       ["module title", "module name", "module", "section", "section title", "chapter"],
  moduleOrder:       ["module order", "module #", "section order", "order"],
  lessonTitle:       ["lesson title", "lesson name", "lesson", "lecture", "lecture title"],
  lessonContent:     ["lesson content", "content", "notes", "lesson notes", "text"],
  videoUrl:          ["video url", "video", "videourl", "video link"],
  isPreview:         ["preview", "free preview", "is preview"],
};

function findHeader(headers: string[], aliases: string[]): string | undefined {
  for (const alias of aliases) {
    const match = headers.find((h) => h.trim().toLowerCase() === alias);
    if (match) return match;
  }
  return undefined;
}

/** Best-guess column mapping based on header names. No source-specific preset
 *  yet (no sample export to build against) — generic alias matching only. */
export function detectMapping(headers: string[]): CourseColumnMapping {
  const mapping: CourseColumnMapping = {};
  for (const field of COURSE_LESSON_FIELDS) {
    const header = findHeader(headers, FIELD_ALIASES[field.key]);
    if (header) mapping[field.key] = header;
  }
  return mapping;
}

// ── Row mapping ───────────────────────────────────────────────────────────────

export type MappedLessonRow = {
  courseTitle: string;
  courseDescription: string | null;
  moduleTitle: string | null;
  moduleOrder: number | null;
  lessonTitle: string;
  lessonContent: string | null;
  videoUrl: string | null;
  isPreview: boolean;
};

const TRUTHY = new Set(["true", "yes", "y", "1"]);

/** Applies a column mapping to one raw CSV row, normalizing values per field. */
export function mapLessonRow(row: Record<string, string>, mapping: CourseColumnMapping): MappedLessonRow {
  const get = (key: CourseLessonFieldKey): string => {
    const header = mapping[key];
    if (!header) return "";
    return (row[header] ?? "").trim();
  };

  const moduleOrderRaw = get("moduleOrder");

  return {
    courseTitle:       get("courseTitle"),
    courseDescription: get("courseDescription") || null,
    moduleTitle:       get("moduleTitle") || null,
    moduleOrder:       moduleOrderRaw ? (parseInt(moduleOrderRaw, 10) || null) : null,
    lessonTitle:       get("lessonTitle"),
    lessonContent:     get("lessonContent") || null,
    videoUrl:          get("videoUrl") || null,
    isPreview:         TRUTHY.has(get("isPreview").toLowerCase()),
  };
}

// ── Grouping: flat lesson rows -> nested Course -> Module -> Lesson tree ───────

export type MappedCourseImportLesson = {
  title: string;
  contentHtml: string | null;
  videoUrl: string | null;
  isPreview: boolean;
};

export type MappedCourseImportModule = {
  title: string;
  order: number;
  lessons: MappedCourseImportLesson[];
};

export type MappedCourseImport = {
  title: string;
  description: string | null;
  modules: MappedCourseImportModule[];
};

/** Groups flat mapped lesson rows into a nested Course -> Module -> Lesson
 *  tree. Courses and modules keep first-seen order; moduleOrder (if present
 *  on any row for that module) sorts modules within a course. Rows missing
 *  a courseTitle or lessonTitle are dropped (caller should surface a warning
 *  for how many were skipped). */
export function groupRowsIntoCourses(rows: MappedLessonRow[]): MappedCourseImport[] {
  const validRows = rows.filter((r) => r.courseTitle.trim() !== "" && r.lessonTitle.trim() !== "");

  type ModuleAcc = { title: string; order: number | null; firstSeen: number; lessons: MappedCourseImportLesson[] };
  type CourseAcc = { title: string; description: string | null; firstSeen: number; modules: Map<string, ModuleAcc> };

  const courses = new Map<string, CourseAcc>();
  let seenIndex = 0;

  for (const row of validRows) {
    const courseKey = row.courseTitle.trim().toLowerCase();
    let course = courses.get(courseKey);
    if (!course) {
      course = { title: row.courseTitle.trim(), description: row.courseDescription, firstSeen: seenIndex++, modules: new Map() };
      courses.set(courseKey, course);
    } else if (!course.description && row.courseDescription) {
      course.description = row.courseDescription;
    }

    const moduleTitle = row.moduleTitle?.trim() || `Module ${course.modules.size + 1}`;
    const moduleKey = moduleTitle.toLowerCase();
    let module = course.modules.get(moduleKey);
    if (!module) {
      module = { title: moduleTitle, order: row.moduleOrder, firstSeen: course.modules.size, lessons: [] };
      course.modules.set(moduleKey, module);
    } else if (module.order === null && row.moduleOrder !== null) {
      module.order = row.moduleOrder;
    }

    module.lessons.push({
      title: row.lessonTitle.trim(),
      contentHtml: row.lessonContent,
      videoUrl: row.videoUrl,
      isPreview: row.isPreview,
    });
  }

  return Array.from(courses.values())
    .sort((a, b) => a.firstSeen - b.firstSeen)
    .map((course) => ({
      title: course.title,
      description: course.description,
      modules: Array.from(course.modules.values())
        .sort((a, b) => (a.order ?? a.firstSeen) - (b.order ?? b.firstSeen))
        .map((m, i) => ({ title: m.title, order: i, lessons: m.lessons })),
    }));
}
