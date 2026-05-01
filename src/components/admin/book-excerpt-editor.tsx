"use client";

import { useState } from "react";
import { Check, Loader2, BookOpen } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface Props {
  bookId: string;
  initial: string | null;
}

export function BookExcerptEditor({ bookId, initial }: Props) {
  const [content, setContent] = useState(initial ?? "");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sampleContent: content || null }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save excerpt.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 space-y-1">
          <p className="font-medium">About book excerpts</p>
          <p className="text-blue-600">
            Paste or type a sample from your book — a first chapter, prologue, or opening pages.
            This appears on your public book page under "Read an Excerpt" to give visitors a taste before they buy.
            Formatting (paragraphs, italics, headings) is preserved.
          </p>
        </div>
      </div>

      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Paste your excerpt here — first chapter, prologue, or opening pages…"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving…" : "Save Excerpt"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {content && (
          <button
            type="button"
            onClick={() => { setContent(""); }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear excerpt
          </button>
        )}
      </div>
    </div>
  );
}
