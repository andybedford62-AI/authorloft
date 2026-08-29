import Link from "next/link";
import Image from "next/image";
import { BookOpen, GraduationCap, ListMusic } from "lucide-react";

interface FlatCoverCardProps {
  href: string;
  title: string;
  coverImageUrl?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  /** Which fallback icon to render when there's no cover image. */
  fallbackIconKind?: "course" | "music";
}

const FALLBACK_ICONS = { course: GraduationCap, music: ListMusic } as const;

/**
 * Flat, non-tilted-paperback sibling of BookCoverTilt (same prop signature,
 * drop-in swap) — used for Courses/Music hero art, where the tilted-spine
 * shadow/ring styling reads as the wrong physical metaphor for a course
 * thumbnail or album cover.
 *
 * Deliberately a Server Component, not a client-side mouse-tracked tilt like
 * BookCoverTilt — an earlier attempt at porting that exact interaction here
 * made this a Client Component and intermittently 500'd in production
 * ("Functions cannot be passed directly to Client Components") in a way that
 * resisted three separate fix attempts (bare icon prop → rendered icon
 * element → string discriminant) without a clear root cause, on this
 * project's Turbopack build. Not worth the risk for a hover effect — this
 * uses a plain CSS hover lift/scale instead, which needs no client boundary
 * at all and can never reproduce that failure class.
 */
export function FlatCoverCard({
  href,
  title,
  coverImageUrl,
  caption,
  width = 160,
  height = 240,
  fallbackIconKind,
}: FlatCoverCardProps) {
  const Icon = fallbackIconKind ? FALLBACK_ICONS[fallbackIconKind] : BookOpen;

  return (
    <div className="flex-shrink-0 order-1 md:order-2">
      <div
        style={{ width, height }}
        className="relative rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] ring-2 ring-white/30 transition-transform duration-300 ease-out hover:scale-[1.04] hover:-translate-y-1"
      >
        <Link href={href} title={title} className="block w-full h-full">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt={title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <Icon className="h-12 w-12 text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </Link>
      </div>
      {caption && (
        <p className="mt-2 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
          {caption}
        </p>
      )}
    </div>
  );
}
