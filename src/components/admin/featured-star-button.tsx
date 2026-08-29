"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";

interface FeaturedStarButtonProps {
  /** e.g. `/api/admin/courses/{id}/feature` or `/api/admin/music/{id}/feature` */
  endpoint: string;
  initialFeatured: boolean;
}

/**
 * Quick-toggle star for the admin list pages (Courses, Music). Only one item
 * per kind can be featured — the API unfeatures any sibling server-side, so
 * a successful toggle refreshes the list to reflect that everywhere at once.
 */
export function FeaturedStarButton({ endpoint, initialFeatured }: FeaturedStarButtonProps) {
  const router = useRouter();
  const [featured, setFeatured] = useState(initialFeatured);
  const [saving, setSaving] = useState(false);

  // router.refresh() re-renders every row's server props (including sibling
  // rows this button didn't itself toggle, whose isFeatured just got cleared
  // server-side) — but an already-mounted instance doesn't re-derive local
  // state from a changed prop on its own, so this button's own star could
  // otherwise stay stale after a sibling star is clicked.
  useEffect(() => {
    setFeatured(initialFeatured);
  }, [initialFeatured]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    const next = !featured;
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      });
      if (!res.ok) throw new Error("Could not update");
      setFeatured(next);
      router.refresh(); // other rows' stars may have just been cleared server-side
    } catch {
      // leave state as-is; the row's star simply won't have changed
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      title={featured ? "Featured — click to remove" : "Mark as featured"}
      className="relative z-10 flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <Loader2 className="h-4 w-4 text-gray-300 animate-spin" />
      ) : (
        <Star className={`h-4 w-4 ${featured ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      )}
    </button>
  );
}
