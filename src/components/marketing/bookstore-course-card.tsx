import { GraduationCap, Star } from "lucide-react";

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
  averageRating: number | null;
  ratingCount: number;
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
    <div className="group relative flex flex-col h-full bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover (16:9 — course covers are landscape, unlike portrait book covers) */}
      <div className="relative w-full aspect-video bg-[#16233d] overflow-hidden">
        {course.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.coverImageUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#93a0bc]">
            <GraduationCap className="h-10 w-10" />
            <span className="text-xs font-serif italic px-4 text-center line-clamp-3">{course.title}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-serif text-base text-[#f3ecdb] leading-snug line-clamp-2">
          <a
            href={course.courseUrl}
            className="group-hover:text-[#d6a94a] transition-colors after:absolute after:inset-0 after:z-0"
          >
            {course.title}
          </a>
        </h3>
        <p className="text-xs text-[#93a0bc] mt-1">
          by{" "}
          <a
            href={course.authorUrl}
            className="relative z-10 text-[#93a0bc] hover:text-[#d6a94a] hover:underline"
          >
            {course.authorName}
          </a>
        </p>

        {course.ratingCount > 0 && course.averageRating !== null && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-3 w-3 ${
                    n <= Math.round(course.averageRating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-[rgba(243,236,219,0.2)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#93a0bc]">{course.averageRating.toFixed(1)}</span>
          </div>
        )}

        {price && (
          <p className={`text-sm font-semibold mt-2 ${isFree ? "text-[#5fbf8a]" : "text-[#f3ecdb]"}`}>{price}</p>
        )}
      </div>
    </div>
  );
}
