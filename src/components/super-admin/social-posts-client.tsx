"use client";

import { useState }    from "react";
import Link            from "next/link";
import { useRouter }   from "next/navigation";
import { Pencil, Trash2, Send, Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";

type PostResult = { platform: string; status: string; platformPostId?: string | null; error?: string | null };
type Post = {
  id:          string;
  caption:     string;
  mediaUrl:    string | null;
  platforms:   string[];
  status:      string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt:   string;
  results:     PostResult[];
};

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  DRAFT:      { label: "Draft",      cls: "bg-gray-100 text-gray-500",   icon: null },
  SCHEDULED:  { label: "Scheduled",  cls: "bg-blue-50 text-blue-700",    icon: <Clock className="h-3 w-3" /> },
  PUBLISHING: { label: "Publishing", cls: "bg-yellow-50 text-yellow-700", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  PUBLISHED:  { label: "Published",  cls: "bg-green-50 text-green-700",  icon: <CheckCircle2 className="h-3 w-3" /> },
  PARTIAL:    { label: "Partial",    cls: "bg-amber-50 text-amber-700",  icon: <AlertCircle className="h-3 w-3" /> },
  FAILED:     { label: "Failed",     cls: "bg-red-50 text-red-700",      icon: <AlertCircle className="h-3 w-3" /> },
};

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: "LI", FACEBOOK: "FB", INSTAGRAM: "IG",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, cls: "bg-gray-100 text-gray-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

export function SocialPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts,      setPosts]      = useState(initialPosts);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const router = useRouter();

  async function handlePublishNow(id: string) {
    if (!confirm("Publish this post now to all selected platforms?")) return;
    setPublishing(id);
    try {
      const res  = await fetch(`/api/super-admin/social/posts/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    } catch (e: any) {
      alert(`Publish failed: ${e.message}`);
    } finally {
      setPublishing(null);
    }
  }

  async function handleDelete(id: string, caption: string) {
    if (!confirm(`Delete this post?\n\n"${caption.slice(0, 80)}…"\n\nThis cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/super-admin/social/posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500 text-sm mb-3">No posts yet.</p>
        <Link href="/super-admin/social/new" className="text-sm font-medium text-purple-600 hover:text-purple-800">
          Create your first post →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const isExp = expanded === post.id;
        const canEdit    = ["DRAFT", "SCHEDULED"].includes(post.status);
        const canPublish = ["DRAFT", "SCHEDULED", "FAILED", "PARTIAL"].includes(post.status);

        return (
          <div key={post.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              {/* Thumbnail */}
              {post.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.mediaUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
                  No image
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-2">{post.caption}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge status={post.status} />
                  {post.platforms.map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                  {post.scheduledAt && post.status === "SCHEDULED" && (
                    <span className="text-xs text-gray-400">
                      {new Date(post.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {post.publishedAt && post.status === "PUBLISHED" && (
                    <span className="text-xs text-gray-400">
                      Published {new Date(post.publishedAt).toLocaleString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                {/* Per-platform results */}
                {post.results.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.results.map((r) => (
                      <span key={r.platform}
                        className={`text-xs px-2 py-0.5 rounded-full ${r.status === "PUBLISHED" ? "bg-green-50 text-green-700" : r.status === "FAILED" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}
                        title={r.error ?? undefined}
                      >
                        {PLATFORM_LABELS[r.platform] ?? r.platform}: {r.status}
                        {r.error && " ⚠"}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {canPublish && (
                  <button
                    onClick={() => handlePublishNow(post.id)}
                    disabled={publishing === post.id}
                    className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                    title="Publish now"
                  >
                    {publishing === post.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : post.status === "PARTIAL" || post.status === "FAILED"
                        ? <RefreshCw className="h-4 w-4" />
                        : <Send className="h-4 w-4" />
                    }
                  </button>
                )}
                {canEdit && (
                  <Link href={`/super-admin/social/${post.id}/edit`}
                    className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(post.id, post.caption)}
                  disabled={deleting === post.id}
                  className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Error details (if any platform failed) */}
            {post.results.some((r) => r.error) && (
              <div className="border-t border-gray-100 px-4 py-2 bg-red-50">
                {post.results.filter((r) => r.error).map((r) => (
                  <p key={r.platform} className="text-xs text-red-600">
                    <strong>{PLATFORM_LABELS[r.platform] ?? r.platform}:</strong> {r.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
