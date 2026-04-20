"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserX } from "lucide-react";

export function ImpersonationBanner({ authorName }: { authorName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function stop() {
    setLoading(true);
    await fetch("/api/super-admin/impersonate", { method: "DELETE" });
    router.push("/super-admin/authors");
  }

  return (
    <div className="w-full bg-amber-400 text-amber-900 text-sm font-medium flex items-center justify-between px-6 py-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <UserX className="h-4 w-4" />
        <span>Impersonating <strong>{authorName}</strong> — you are viewing their admin as them.</span>
      </div>
      <button
        onClick={stop}
        disabled={loading}
        className="px-3 py-1 rounded bg-amber-900 text-amber-50 text-xs font-semibold hover:bg-amber-800 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {loading ? "Stopping…" : "Stop Impersonating"}
      </button>
    </div>
  );
}
