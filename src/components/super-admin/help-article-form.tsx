"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";

interface Subtopic { id: string; title: string; }
interface Topic    { id: string; title: string; subtopics: Subtopic[]; }
interface Article  { id: string; topicId: string; subtopicId: string | null; question: string; answer: string; sortOrder: number; isPublished: boolean; }

interface Props {
  topics:   Topic[];
  article?: Article;
}

export function HelpArticleForm({ topics, article }: Props) {
  const router  = useRouter();
  const isEdit  = !!article;

  const [topicId,     setTopicId]     = useState(article?.topicId     ?? "");
  const [subtopicId,  setSubtopicId]  = useState(article?.subtopicId  ?? "");
  const [question,    setQuestion]    = useState(article?.question     ?? "");
  const [answer,      setAnswer]      = useState(article?.answer       ?? "");
  const [sortOrder,   setSortOrder]   = useState(article?.sortOrder    ?? 0);
  const [isPublished, setIsPublished] = useState(article?.isPublished  ?? true);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const subtopics = topics.find((t) => t.id === topicId)?.subtopics ?? [];

  // Reset subtopic when topic changes
  useEffect(() => {
    if (!subtopics.find((s) => s.id === subtopicId)) setSubtopicId("");
  }, [topicId]);

  async function handleSave() {
    if (!topicId) { setError("Please select a topic."); return; }
    if (!question.trim()) { setError("Question is required."); return; }
    if (!answer.trim()) { setError("Answer is required."); return; }

    setSaving(true);
    setError(null);

    const url    = isEdit ? `/api/super-admin/help/articles/${article.id}` : "/api/super-admin/help/articles";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, subtopicId: subtopicId || null, question, answer, sortOrder, isPublished }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) { setError(json.error ?? "Save failed."); return; }
    router.push("/super-admin/help");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this article permanently? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/super-admin/help/articles/${article!.id}`, { method: "DELETE" });
    router.push("/super-admin/help");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Help Centre
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Topic + Subtopic */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic <span className="text-red-500">*</span></label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select topic —</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtopic <span className="text-gray-400">(optional)</span></label>
            <select
              value={subtopicId}
              onChange={(e) => setSubtopicId(e.target.value)}
              disabled={!topicId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— No subtopic —</option>
              {subtopics.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Question <span className="text-red-500">*</span></h2>
        <p className="text-xs text-gray-500">Write the question as an author would ask it. Keep it concise.</p>
        <RichTextEditor
          value={question}
          onChange={setQuestion}
          placeholder="e.g. How do I set up Stripe to receive payments?"
        />
      </div>

      {/* Answer */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Answer <span className="text-red-500">*</span></h2>
        <p className="text-xs text-gray-500">Write a clear, step-by-step answer. Use headings, lists, bold text, and links where helpful.</p>
        <RichTextEditor
          value={answer}
          onChange={setAnswer}
          placeholder="Write your answer here…"
        />
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Options</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">Published (visible to authors)</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Article
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Article"}
        </button>
      </div>
    </div>
  );
}
