"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";

interface Props {
  postId: string;
  postTitle: string;
  redirectTo?: string;   // if set, navigate here after deletion instead of refreshing
}

export function BlogDeleteButton({ postId, postTitle, redirectTo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete post. Please try again.");
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 hidden sm:inline">Delete &quot;{postTitle}&quot;?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
        {deleteError && <span className="text-xs text-red-600 w-full">{deleteError}</span>}
      </div>
    );
  }

  return (
    <IconButton
      icon={<Trash2 className="h-4 w-4" />}
      title="Delete"
      variant="delete"
      onClick={() => setConfirming(true)}
    />
  );
}
