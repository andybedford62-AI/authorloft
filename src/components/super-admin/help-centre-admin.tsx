"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronRight, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";
import { sanitize } from "@/lib/sanitize";

// ── Types ────────────────────────────────────────────────────────────────────

interface Subtopic { id: string; title: string; slug: string; sortOrder: number; }
interface Topic    {
  id: string; title: string; slug: string; description: string | null;
  icon: string | null; sortOrder: number; isPublished: boolean;
  subtopics: Subtopic[];
  _count: { articles: number };
}
interface Article  {
  id: string; topicId: string; subtopicId: string | null;
  question: string; answer: string;
  isPublished: boolean; sortOrder: number;
  topic: { id: string; title: string };
  subtopic: { id: string; title: string } | null;
}
interface Tooltip  { id: string; tooltipKey: string; title: string; content: string; learnMoreUrl: string | null; }

interface Props {
  initialTopics:   Topic[];
  initialArticles: Article[];
  initialTooltips: Tooltip[];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Articles Tab ──────────────────────────────────────────────────────────────

function ArticlesTab({ articles, topics }: { articles: Article[]; topics: Topic[] }) {
  const router = useRouter();
  const [search,       setSearch]       = useState("");
  const [filterTopic,  setFilterTopic]  = useState("");
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      stripHtml(a.question).toLowerCase().includes(q) ||
      stripHtml(a.answer).toLowerCase().includes(q) ||
      a.topic.title.toLowerCase().includes(q);
    const matchTopic = !filterTopic || a.topicId === filterTopic;
    return matchSearch && matchTopic;
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/super-admin/help/articles/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <Link
          href="/super-admin/help/articles/new"
          className="inline-flex items-center gap-2 rounded-lg font-medium h-10 px-5 text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> New Article
        </Link>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</p>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            No articles found.
          </div>
        )}
        {filtered.map((article) => (
          <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === article.id ? null : article.id)}
            >
              <div className="mt-0.5 text-gray-400">
                {expanded === article.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium text-gray-900 [&>p]:inline"
                  dangerouslySetInnerHTML={{ __html: sanitize(article.question) }}
                />
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{article.topic.title}</span>
                  {article.subtopic && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{article.subtopic.title}</span>
                  )}
                  {!article.isPublished && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Draft</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/super-admin/help/articles/${article.id}/edit`} onClick={(e) => e.stopPropagation()}>
                  <IconButton icon={<Edit2 className="h-4 w-4" />} title="Edit article" variant="edit" />
                </Link>
                <span onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    icon={deleting === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    title="Delete article"
                    variant="delete"
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                  />
                </span>
              </div>
            </div>

            {expanded === article.id && (
              <div
                className="px-5 py-4 border-t border-gray-100 prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: sanitize(article.answer) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Topics Tab ────────────────────────────────────────────────────────────────

function TopicsTab({ topics: initialTopics }: { topics: Topic[] }) {
  const router = useRouter();
  const [topics,    setTopics]    = useState(initialTopics);
  const [newTitle,  setNewTitle]  = useState("");
  const [newSlug,   setNewSlug]   = useState("");
  const [newIcon,   setNewIcon]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Subtopic state
  const [subtopicTopicId, setSubtopicTopicId] = useState("");
  const [subtopicTitle,   setSubtopicTitle]   = useState("");
  const [subtopicSlug,    setSubtopicSlug]    = useState("");
  const [subtopicSaving,  setSubtopicSaving]  = useState(false);

  async function addTopic() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    setSaving(true);
    const res  = await fetch("/api/super-admin/help/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, icon: newIcon }),
    });
    const data = await res.json();
    if (res.ok) {
      setTopics((prev) => [...prev, { ...data, subtopics: [], _count: { articles: 0 } }]);
      setNewTitle(""); setNewSlug(""); setNewIcon("");
    }
    setSaving(false);
  }

  async function updateTopic(id: string) {
    await fetch(`/api/super-admin/help/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    });
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, title: editTitle } : t));
    setEditingId(null);
    router.refresh();
  }

  async function deleteTopic(id: string) {
    if (!confirm("Delete this topic and ALL its subtopics and articles? This cannot be undone.")) return;
    await fetch(`/api/super-admin/help/topics/${id}`, { method: "DELETE" });
    setTopics((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  async function addSubtopic() {
    if (!subtopicTopicId || !subtopicTitle.trim() || !subtopicSlug.trim()) return;
    setSubtopicSaving(true);
    const res  = await fetch("/api/super-admin/help/subtopics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: subtopicTopicId, title: subtopicTitle, slug: subtopicSlug }),
    });
    const data = await res.json();
    if (res.ok) {
      setTopics((prev) => prev.map((t) =>
        t.id === subtopicTopicId ? { ...t, subtopics: [...t.subtopics, data] } : t
      ));
      setSubtopicTitle(""); setSubtopicSlug("");
    }
    setSubtopicSaving(false);
  }

  async function deleteSubtopic(topicId: string, subtopicId: string) {
    if (!confirm("Delete this subtopic? Articles in it will become uncategorised.")) return;
    await fetch(`/api/super-admin/help/subtopics/${subtopicId}`, { method: "DELETE" });
    setTopics((prev) => prev.map((t) =>
      t.id === topicId ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subtopicId) } : t
    ));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Topics list */}
      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              {editingId === topic.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm" onClick={() => updateTopic(topic.id)}>
                    <Check className="h-3.5 w-3.5 mr-1.5" />Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{topic.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {topic._count.articles} article{topic._count.articles !== 1 ? "s" : ""} · {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <IconButton icon={<Edit2 className="h-4 w-4" />} title="Edit topic" variant="edit" onClick={() => { setEditingId(topic.id); setEditTitle(topic.title); }} />
                  <IconButton icon={<Trash2 className="h-4 w-4" />} title="Delete topic" variant="delete" onClick={() => deleteTopic(topic.id)} />
                </>
              )}
            </div>

            {topic.subtopics.length > 0 && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {topic.subtopics.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 px-8 py-2.5">
                    <span className="flex-1 text-sm text-gray-600">{sub.title}</span>
                    <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} title="Delete subtopic" variant="delete" onClick={() => deleteSubtopic(topic.id, sub.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add topic */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Add Topic</h3>
        <div className="flex flex-wrap gap-3">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug" className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="Icon (e.g. BookOpen)" className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={addTopic} disabled={saving || !newTitle.trim() || !newSlug.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Plus className="h-4 w-4 mr-2" />Add</>}
          </Button>
        </div>
      </div>

      {/* Add subtopic */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Add Subtopic</h3>
        <div className="flex flex-wrap gap-3">
          <select value={subtopicTopicId} onChange={(e) => setSubtopicTopicId(e.target.value)} className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select topic…</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <input value={subtopicTitle} onChange={(e) => setSubtopicTitle(e.target.value)} placeholder="Subtopic title" className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={subtopicSlug} onChange={(e) => setSubtopicSlug(e.target.value)} placeholder="slug" className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={addSubtopic} disabled={subtopicSaving || !subtopicTopicId || !subtopicTitle.trim() || !subtopicSlug.trim()}>
            {subtopicSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Plus className="h-4 w-4 mr-2" />Add</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Tooltips Tab ──────────────────────────────────────────────────────────────

function TooltipsTab({ tooltips: initialTooltips }: { tooltips: Tooltip[] }) {
  const [tooltips,  setTooltips]  = useState(initialTooltips);
  const [newKey,    setNewKey]    = useState("");
  const [newTitle,  setNewTitle]  = useState("");
  const [newContent,setNewContent]= useState("");
  const [newUrl,    setNewUrl]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData,  setEditData]  = useState<Partial<Tooltip>>({});

  async function addTooltip() {
    if (!newKey.trim() || !newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    const res  = await fetch("/api/super-admin/help/tooltips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tooltipKey: newKey, title: newTitle, content: newContent, learnMoreUrl: newUrl || null }),
    });
    const data = await res.json();
    if (res.ok) {
      setTooltips((prev) => [...prev, data]);
      setNewKey(""); setNewTitle(""); setNewContent(""); setNewUrl("");
    }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/super-admin/help/tooltips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setTooltips((prev) => prev.map((t) => t.id === id ? { ...t, ...editData } : t));
    setEditingId(null);
  }

  async function deleteTooltip(id: string) {
    if (!confirm("Delete this tooltip?")) return;
    await fetch(`/api/super-admin/help/tooltips/${id}`, { method: "DELETE" });
    setTooltips((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Tooltips are shown as <code className="text-xs bg-gray-100 px-1 rounded">?</code> icons next to form fields across the admin dashboard.</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Key</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Content</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tooltips.map((tooltip) => (
              <tr key={tooltip.id} className="hover:bg-gray-50">
                {editingId === tooltip.id ? (
                  <>
                    <td className="px-5 py-2">
                      <input value={editData.tooltipKey ?? tooltip.tooltipKey} onChange={(e) => setEditData((p) => ({ ...p, tooltipKey: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </td>
                    <td className="px-5 py-2">
                      <input value={editData.title ?? tooltip.title} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </td>
                    <td className="px-5 py-2 hidden md:table-cell">
                      <input value={editData.content ?? tooltip.content} onChange={(e) => setEditData((p) => ({ ...p, content: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </td>
                    <td className="px-5 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(tooltip.id)}>
                          <Check className="h-3.5 w-3.5 mr-1.5" />Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{tooltip.tooltipKey}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{tooltip.title}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">{tooltip.content}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <IconButton icon={<Edit2 className="h-3.5 w-3.5" />} title="Edit tooltip" variant="edit" onClick={() => { setEditingId(tooltip.id); setEditData({}); }} />
                        <IconButton icon={<Trash2 className="h-3.5 w-3.5" />} title="Delete tooltip" variant="delete" onClick={() => deleteTooltip(tooltip.id)} />
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Add Tooltip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="tooltip-key (e.g. stripe-connect)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Short description (1-2 sentences)" className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Learn more URL (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={addTooltip} disabled={saving || !newKey.trim() || !newTitle.trim() || !newContent.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Plus className="h-4 w-4 mr-2" />Add Tooltip</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function HelpCentreAdmin({ initialTopics, initialArticles, initialTooltips }: Props) {
  const [tab, setTab] = useState<"articles" | "topics" | "tooltips">("articles");

  const tabs = [
    { id: "articles" as const,  label: `Articles (${initialArticles.length})` },
    { id: "topics"   as const,  label: `Topics & Subtopics (${initialTopics.length})` },
    { id: "tooltips" as const,  label: `Tooltips (${initialTooltips.length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "articles" && <ArticlesTab articles={initialArticles} topics={initialTopics} />}
      {tab === "topics"   && <TopicsTab   topics={initialTopics} />}
      {tab === "tooltips" && <TooltipsTab tooltips={initialTooltips} />}
    </div>
  );
}
