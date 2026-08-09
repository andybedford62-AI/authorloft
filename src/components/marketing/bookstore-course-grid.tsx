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
        <div className="bg-white rounded-xl border border-[#DCDBD3] p-3 mb-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9b8e7e] mr-0.5">
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
                      ? "bg-[#27406B] text-white border-[#27406B]"
                      : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#27406B]"
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
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] hover:text-[#1B2B47] transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#DCDBD3]">
          <GraduationCap className="h-10 w-10 text-[#D4DDEB] mx-auto mb-3" />
          <p className="text-[#5C6E89] mb-4">No courses match your selected categories.</p>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#C26A4A] px-4 py-2 rounded-full hover:bg-[#a8573a] transition-colors"
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
