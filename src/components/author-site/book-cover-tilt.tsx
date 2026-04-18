"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

interface BookCoverTiltProps {
  href: string;
  title: string;
  coverImageUrl?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
}

export function BookCoverTilt({
  href,
  title,
  coverImageUrl,
  caption,
  width = 160,
  height = 240,
}: BookCoverTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 20}deg) rotateX(${-y * 15}deg) scale3d(1.06,1.06,1.06)`;
  }

  function onMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }

  return (
    <div className="flex-shrink-0 order-1 md:order-2">
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          width,
          height,
          transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] ring-2 ring-white/30"
      >
        <Link href={href} title={title} className="block w-full h-full">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/40" />
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
