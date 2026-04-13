"use client";

import { useState } from "react";
import { Save, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface LegalNoticeFormProps {
  initialContent: string;
  updatedAt: string | null;
}

export function LegalNoticeForm({ initialContent, updatedAt }: LegalNoticeFormProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const isDirty = content !== initialContent;

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalNotice: content }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("success");
      // Reset dirty state — treat saved content as the new baseline
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setContent(initialContent);
    setStatus("idle");
  }

  return (
    <div className="space-y-4">
      {/* Last updated badge */}
      {updatedAt && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          Last saved{" "}
          {new Date(updatedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Editor */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Markdown supported
          </span>
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setStatus("idle");
          }}
          rows={28}
          className="w-full px-4 py-3 text-sm font-mono text-gray-800 bg-white focus:outline-none resize-none leading-relaxed"
          placeholder="Enter your legal notice content here…"
          spellCheck={false}
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              Save failed — please try again
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Discard changes
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Legal Notice"}
          </button>
        </div>
      </div>

      {/* Preview hint */}
      <p className="text-xs text-gray-400">
        Your legal notice will be published at{" "}
        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">/legal</span>{" "}
        on your author site and linked from your footer.
      </p>
    </div>
  );
}
