import { GraduationCap } from "lucide-react";

export type BookstoreCourse = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  authorName: string;
  authorUrl: string;   // absolute URL to the author's own site root
  courseUrl: string;   // absolute URL to the course page on the author's own site
  description: string | null; // stripped plain-text blurb
  priceCents: number | null;
  categories: string[];
  sortTimestamp: number; // for "Newest" sort (createdAt)
};

function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export function BookstoreCourseCard({ course }: { course: BookstoreCourse }) {
  const price = formatPrice(course.priceCents);
  const isFree = course.priceCents === 0;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover (16:9 — course covers are landscape, unlike portrait book covers) */}
      <div className="relative w-full aspect-video bg-[#E8E2D5] overflow-hidden">
        {course.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.coverImageUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#B6A88F]">
            <GraduationCap className="h-10 w-10" />
            <span className="text-xs font-serif italic px-4 text-center line-clamp-3">{course.title}</span>
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm text-white bg-[#27406B]">
          <GraduationCap className="h-2.5 w-2.5" /> Course
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-serif text-base text-[#1B2B47] leading-snug line-clamp-2">
          <a
            href={course.courseUrl}
            className="group-hover:text-[#C26A4A] transition-colors after:absolute after:inset-0 after:z-0"
          >
            {course.title}
          </a>
        </h3>
        <p className="text-xs text-[#9b8e7e] mt-1">
          by{" "}
          <a
            href={course.authorUrl}
            className="relative z-10 text-[#5C6E89] hover:text-[#C26A4A] hover:underline"
          >
            {course.authorName}
          </a>
        </p>

        {price && (
          <p className={`text-sm font-semibold mt-2 ${isFree ? "text-[#3B6D11]" : "text-[#1B2B47]"}`}>{price}</p>
        )}
      </div>
    </div>
  );
}
