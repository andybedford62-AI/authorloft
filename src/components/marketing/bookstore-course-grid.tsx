"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, GraduationCap } from "lucide-react";
import { type BookstoreCourse, BookstoreCourseCard } from "@/components/marketing/bookstore-course-card";

export function BookstoreCourseGrid({
  courses,
  allCategories,
}: {
  courses: BookstoreCourse[];
  allCategories: string[];
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // lowercased category names

  function toggleCategory(name: string) {
    const key = name.toLowerCase();
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  function resetAll() {
    setSelectedCategories([]);
  }

  const filtered = useMemo(() => {
    if (selectedCategories.length === 0) return courses;
    return courses.filter((c) => {
      const courseCategoryKeys = c.categories.map((cat) => cat.toLowerCase());
      return selectedCategories.every((cat) => courseCategoryKeys.includes(cat));
    });
  }, [courses, selectedCategories]);

  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div>
      {/* Category chips — only shown once there's something to filter by */}
      {allCategories.length > 0 && (
        <div className="bg-[#1e2f4d] rounded-xl border border-[rgba(243,236,219,0.12)] p-3 mb-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#93a0bc] mr-0.5">
              <SlidersHorizontal className="h-3 w-3" /> Categories:
            </span>
            {allCategories.map((cat) => {
              const active = selectedCategories.includes(cat.toLowerCase());
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-colors ${
                    active
                      ? "bg-[#d6a94a] text-[#16233d] border-[#d6a94a]"
                      : "bg-[#16233d] text-[#93a0bc] border-[rgba(243,236,219,0.15)] hover:border-[#d6a94a]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[#d6a94a] hover:text-[#f3ecdb] transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)]">
          <GraduationCap className="h-10 w-10 text-[#93a0bc] mx-auto mb-3" />
          <p className="text-[#93a0bc] mb-4">No courses match your selected categories.</p>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#16233d] bg-[#d6a94a] px-4 py-2 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((course) => (
            <BookstoreCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
