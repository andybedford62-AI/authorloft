"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, XCircle, ExternalLink, BookOpen,
  Mail, Pencil, Trash2, Loader2, UserCheck, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";
import { SendAuthorEmailModal } from "./send-author-email-modal";

type Author = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  slug: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  isFoundingMember: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  plan: { name: string; tier: string; monthlyPriceCents: number } | null;
  _count: { books: number; subscribers: number; orders: number };
};

const TIER_VARIANT: Record<string, "plan-premium" | "plan-standard" | "warning"> = {
  PREMIUM:  "plan-premium",
  STANDARD: "plan-standard",
  FREE:     "warning",
};

// Helper to format relative time (e.g., "2 days ago", "1 hour ago", "Never")
function formatLastLogin(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function AuthorsTableClient({ authors: initial }: { authors: Author[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initial);
  const [toggling,      setToggling]      = useState<string | null>(null);
  const [togglingFounding, setTogglingFounding] = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [confirmId,     setConfirmId]     = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [emailTarget,   setEmailTarget]   = useState<Author | null>(null);

  async function toggleActive(author: Author) {
    setToggling(author.id);
    try {
      const res = await fetch(`/api/super-admin/authors/${author.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !author.isActive }),
      });
      if (res.ok) {
        setAuthors((prev) =>
          prev.map((a) => (a.id === author.id ? { ...a, isActive: !author.isActive } : a))
        );
        router.refresh();
      }
    } finally {
      setToggling(null);
    }
  }

  async function toggleFoundingMember(author: Author) {
    setTogglingFounding(author.id);
    try {
      const res = await fetch(`/api/super-admin/authors/${author.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFoundingMember: !author.isFoundingMember }),
      });
      if (res.ok) {
        setAuthors((prev) =>
          prev.map((a) => (a.id === author.id ? { ...a, isFoundingMember: !author.isFoundingMember } : a))
        );
        router.refresh();
      }
    } finally {
      setTogglingFounding(null);
    }
  }

  async function handleImpersonate(author: Author) {
    setImpersonating(author.id);
    try {
      const res = await fetch("/api/super-admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: author.id }),
      });
      if (res.ok) router.push("/admin/dashboard");
    } finally {
      setImpersonating(null);
    }
  }

  async function handleDelete(author: Author) {
    setDeleting(author.id);
    try {
      const res = await fetch(`/api/super-admin/authors/${author.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAuthors((prev) => prev.filter((a) => a.id !== author.id));
        router.refresh();
      }
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Author</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Books</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Subscribers</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden xl:table-cell">Last Login</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {authors.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No authors found.
                </td>
              </tr>
            )}
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                {/* Name / email / slug */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700 flex-shrink-0">
                      {(author.displayName || author.name)[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{author.displayName || author.name}</p>
                        {author.isSuperAdmin && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">SA</span>
                        )}
                        {author.isFoundingMember && (
                          <span
                            title="Founding Member"
                            className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium"
                          >
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Founding
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{author.email}</p>
                      <p className="text-xs text-blue-400">{author.slug}.authorloft.com</p>
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-5 py-4 hidden sm:table-cell">
                  <Badge variant={TIER_VARIANT[author.plan?.tier ?? "FREE"] ?? "default"}>
                    {author.plan?.name ?? "No Plan"}
                  </Badge>
                </td>

                {/* Books */}
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                    {author._count.books}
                  </div>
                </td>

                {/* Subscribers */}
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    {author._count.subscribers}
                  </div>
                </td>

                {/* Active toggle */}
                <td className="px-5 py-4 hidden lg:table-cell">
                  <button
                    onClick={() => toggleActive(author)}
                    disabled={!!toggling}
                    title="Click to toggle active status"
                    className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40 cursor-pointer"
                  >
                    {toggling === author.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : author.isActive ? (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500">
                        <XCircle className="h-4 w-4" /> Inactive
                      </span>
                    )}
                  </button>
                </td>

                {/* Joined date */}
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs text-gray-500">
                    {new Date(author.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </td>

                {/* Last login */}
                <td className="px-5 py-4 hidden xl:table-cell">
                  <span className="text-xs text-gray-500">
                    {formatLastLogin(author.lastLoginAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* Send personal email */}
                    <IconButton
                      icon={<Mail className="h-4 w-4" />}
                      title="Send email"
                      variant="ghost"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setEmailTarget(author)}
                    />

                    {/* Impersonate */}
                    <IconButton
                      icon={<UserCheck className="h-4 w-4" />}
                      title="Impersonate author"
                      variant="ghost"
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => handleImpersonate(author)}
                      disabled={!!impersonating}
                      loading={impersonating === author.id}
                    />

                    {/* Founding member toggle */}
                    <IconButton
                      icon={<Star className={author.isFoundingMember ? "h-4 w-4 fill-amber-500" : "h-4 w-4"} />}
                      title={author.isFoundingMember ? "Remove Founding Member status" : "Mark as Founding Member"}
                      variant="ghost"
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => toggleFoundingMember(author)}
                      disabled={!!togglingFounding}
                      loading={togglingFounding === author.id}
                    />

                    {/* View live site */}
                    <a
                      href={`https://${author.slug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton
                        icon={<ExternalLink className="h-4 w-4" />}
                        title="View live site"
                        variant="view"
                      />
                    </a>

                    {/* Edit */}
                    <Link href={`/super-admin/authors/${author.id}`}>
                      <IconButton icon={<Pencil className="h-4 w-4" />} title="Edit author" variant="edit" />
                    </Link>

                    {/* Delete */}
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      title="Delete author"
                      variant="delete"
                      onClick={() => setConfirmId(author.id)}
                      disabled={!!deleting}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmId && (() => {
        const target = authors.find((a) => a.id === confirmId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete author account?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This will permanently delete{" "}
                    <strong>{target.displayName || target.name}</strong> and all
                    associated books, posts, and data. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(target)}
                  disabled={!!deleting}
                >
                  {deleting
                    ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Deleting…</>
                    : <><Trash2 className="h-4 w-4 mr-1.5" />Yes, delete</>}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Send personal email modal */}
      {emailTarget && (
        <SendAuthorEmailModal author={emailTarget} onClose={() => setEmailTarget(null)} />
      )}
    </>
  );
}
