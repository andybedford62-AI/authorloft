import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";

interface FlatCoverCardProps {
  href: string;
  title: string;
  coverImageUrl?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  icon?: LucideIcon;
}

/**
 * Flat, non-tilted sibling of BookCoverTilt (same prop signature, drop-in
 * swap) — used for Courses/Music hero art, where the 3D tilted-paperback
 * effect reads as the wrong physical metaphor for a course thumbnail or
 * album cover.
 */
export function FlatCoverCard({
  href,
  title,
  coverImageUrl,
  caption,
  width = 160,
  height = 240,
  icon: Icon = BookOpen,
}: FlatCoverCardProps) {
  return (
    <div className="flex-shrink-0 order-1 md:order-2">
      <div
        style={{ width, height }}
        className="relative rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] ring-2 ring-white/30"
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
