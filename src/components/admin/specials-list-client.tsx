"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Pencil, Clock, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";

interface Special {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

interface SpecialsListClientProps {
  specials: Special[];
}

export function SpecialsListClient({ specials: initial }: SpecialsListClientProps) {
  const [specials, setSpecials] = useState<Special[]>(initial);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const now = new Date();

  async function toggleActive(special: Special) {
    setTogglingId(special.id);
    const nextActive = !special.isActive;

    // Optimistic update
    setSpecials((prev) =>
      prev.map((s) => (s.id === special.id ? { ...s, isActive: nextActive } : s))
    );

    try {
      const res = await fetch(`/api/admin/specials/${special.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       special.title,
          description: special.description,
          imageUrl:    special.imageUrl,
          ctaLabel:    special.ctaLabel,
          ctaUrl:      special.ctaUrl,
          startsAt:    special.startsAt,
          endsAt:      special.endsAt,
          isActive:    nextActive,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Revert on failure
      setSpecials((prev) =>
        prev.map((s) => (s.id === special.id ? { ...s, isActive: !nextActive } : s))
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (specials.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-500">No specials yet</p>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Create promotions, limited-time deals, signed copies, bundles, and exclusive offers
          that appear on your public Specials page.
        </p>
        <Link
          href="/admin/specials/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Special
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {specials.map((special) => {
        const isExpired = special.endsAt ? new Date(special.endsAt) <= now : false;
        const endsAtDate = special.endsAt ? new Date(special.endsAt) : null;
        const startsAtDate = special.startsAt ? new Date(special.startsAt) : null;
        const daysLeft = endsAtDate
          ? Math.ceil((endsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const isLive = special.isActive && !isExpired;
        const isToggling = togglingId === special.id;

        return (
          <div
            key={special.id}
            className={`bg-white rounded-xl border overflow-hidden flex transition-all ${
              isExpired
                ? "border-red-100 opacity-60"
                : !special.isActive
                ? "border-gray-200 opacity-75"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Image thumbnail */}
            <div className="w-24 sm:w-32 flex-shrink-0 bg-gray-100 relative">
              {special.imageUrl ? (
                <Image
                  src={special.imageUrl}
                  alt={special.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Tag className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{special.title}</h3>

                    {/* Status badge */}
                    {isExpired ? (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Expired
                      </span>
                    ) : isLive ? (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Live
                      </span>
                    ) : (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Hidden
                      </span>
                    )}

                    {/* Countdown */}
                    {isLive && daysLeft !== null && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="h-3 w-3" />
                        {daysLeft <= 0 ? "Ends today" : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>

                  {/* Description preview — strip HTML tags for plain preview */}
                  {special.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {special.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                    </p>
                  )}

                  {/* Date range + CTA */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    {startsAtDate && (
                      <span>From {startsAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                    {endsAtDate && (
                      <span>{startsAtDate ? "·" : ""} Ends {endsAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    )}
                    {!startsAtDate && !endsAtDate && (
                      <span>No expiry</span>
                    )}
                    {special.ctaUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={special.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-gray-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {special.ctaLabel || "CTA link"}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">

                  {/* Inline show/hide toggle */}
                  {!isExpired && (
                    <button
                      type="button"
                      onClick={() => toggleActive(special)}
                      disabled={isToggling}
                      title={special.isActive ? "Hide from public site" : "Show on public site"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                        special.isActive
                          ? "border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          : "border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : special.isActive ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      {special.isActive ? "Live" : "Hidden"}
                    </button>
                  )}

                  {/* Edit */}
                  <Link
                    href={`/admin/specials/${special.id}/edit`}
                    title="Edit special"
                    aria-label="Edit special"
                    className="relative group/tip p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                      Edit special
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
