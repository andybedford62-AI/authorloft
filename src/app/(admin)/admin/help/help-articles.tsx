"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

interface Article  { id: string; question: string; answer: string; }
interface Subtopic { id: string; title: string; slug: string; articles: Article[]; }
interface Topic    { id: string; title: string; slug: string; description: string | null; icon: string | null; subtopics: Subtopic[]; articles: Article[]; }

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ArticleItem({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="mt-0.5 text-gray-400 flex-shrink-0">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span
          className="flex-1 text-sm font-medium text-gray-900 [&>p]:inline"
          dangerouslySetInnerHTML={{ __html: sanitize(article.question) }}
        />
      </button>
      {open && (
        <div
          className="px-12 pb-5 prose prose-sm max-w-none text-gray-700
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs"
          dangerouslySetInnerHTML={{ __html: sanitize(article.answer) }}
        />
      )}
    </div>
  );
}

export function HelpArticles() {
  const [topics,      setTopics]      = useState<Topic[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState("");
  const [search,      setSearch]      = useState("");
  const [activeTopicId, setActiveTopicId] = useState<string | "all">("all");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/help");
        if (!r.ok) { setFetchError("Could not load help articles."); return; }
        const data = await r.json().catch(() => ({}));
        setTopics(data.topics ?? []);
      } catch {
        setFetchError("Could not load help articles. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Flatten all articles for search
  const allArticles: (Article & { topicTitle: string; subtopicTitle?: string })[] = topics.flatMap((t) => [
    ...t.articles.map((a) => ({ ...a, topicTitle: t.title })),
    ...t.subtopics.flatMap((s) => s.articles.map((a) => ({ ...a, topicTitle: t.title, subtopicTitle: s.title }))),
  ]);

  const searchActive = search.trim().length > 0;

  const searchResults = searchActive
    ? allArticles.filter((a) =>
        stripHtml(a.question).toLowerCase().includes(search.toLowerCase()) ||
        stripHtml(a.answer).toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const visibleTopics = activeTopicId === "all"
    ? topics
    : topics.filter((t) => t.id === activeTopicId);

  if (fetchError) {
    return <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">{fetchError}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search help articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
          Loading help articles…
        </div>
      )}

      {/* Search results */}
      {!loading && searchActive && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;</p>
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <HelpCircle className="h-8 w-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No articles found</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or browse by topic below.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {searchResults.map((a) => (
                <div key={a.id}>
                  <div className="px-5 pt-3 pb-0">
                    <span className="text-xs text-blue-600 font-medium">
                      {a.topicTitle}{a.subtopicTitle ? ` › ${a.subtopicTitle}` : ""}
                    </span>
                  </div>
                  <ArticleItem article={a} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topic filter tabs */}
      {!loading && !searchActive && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTopicId("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTopicId === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Topics
            </button>
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTopicId === t.id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>

          {/* Articles by topic */}
          <div className="space-y-4">
            {visibleTopics.map((topic) => {
              const totalArticles = topic.articles.length + topic.subtopics.reduce((s, st) => s + st.articles.length, 0);
              if (totalArticles === 0) return null;
              return (
                <div key={topic.id} className="space-y-3">
                  <h2 className="text-base font-semibold text-gray-800">{topic.title}</h2>
                  {topic.description && <p className="text-sm text-gray-500 -mt-1">{topic.description}</p>}

                  {/* Top-level articles (no subtopic) */}
                  {topic.articles.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {topic.articles.map((a) => <ArticleItem key={a.id} article={a} />)}
                    </div>
                  )}

                  {/* Subtopics */}
                  {topic.subtopics.map((sub) => sub.articles.length > 0 && (
                    <div key={sub.id} className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-600 pl-1">{sub.title}</h3>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {sub.articles.map((a) => <ArticleItem key={a.id} article={a} />)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
