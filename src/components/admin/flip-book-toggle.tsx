"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function FlipBookToggle({ id, initialActive }: { id: string; initialActive: boolean }) {
  const [active,  setActive]  = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flip-books/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !active }),
      });
      if (res.ok) setActive((v) => !v);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Click to hide" : "Click to show"}
      className="flex items-center gap-1.5 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <span
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            active ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              active ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
      )}
      <span className={`text-xs font-medium ${active ? "text-green-700" : "text-gray-400"}`}>
        {active ? "Active" : "Hidden"}
      </span>
    </button>
  );
}
