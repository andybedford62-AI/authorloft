"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Play, Save, RotateCcw, FileText, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type PromoType = {
  id: string;
  slug: string;
  name: string;
  description: string;
  promptTemplate: string;
  applicableContexts: string[];
  applicablePlatforms: string[];
  isActive: boolean;
  sortOrder: number;
};

type Platform = { id: string; slug: string; name: string; maxChars: number; promptAddendum: string | null };
type Book     = { id: string; title: string; subtitle: string | null };

type TestResult = {
  postId: string;
  outputText: string;
  assembledPrompt: string;
  inputTokens: number;
  outputTokens: number;
  costMicroCents: number;
  modelUsed: string;
  maxChars: number;
};

export function SocialPromotePromptsPanel({
  promoTypes, platforms, books,
}: {
  promoTypes: PromoType[];
  platforms: Platform[];
  books: Book[];
}) {
  const router = useRouter();
  const [selectedPromoId, setSelectedPromoId] = useState<string>(promoTypes[0]?.id ?? "");
  const selected = useMemo(() => promoTypes.find((p) => p.id === selectedPromoId), [promoTypes, selectedPromoId]);

  const [draftTemplate, setDraftTemplate] = useState<string>(selected?.promptTemplate ?? "");
  const [draftDescription, setDraftDescription] = useState<string>(selected?.description ?? "");
  const [dirty, setDirty] = useState(false);

  const [platformSlug, setPlatformSlug] = useState<string>(platforms[0]?.slug ?? "");
  const [contextType, setContextType] = useState<"book" | "news" | "topic">("book");
  const [bookId, setBookId] = useState<string>(books[0]?.id ?? "");
  const [topicText, setTopicText] = useState<string>("");
  const [overrideVoice, setOverrideVoice] = useState<string>("");

  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  function pickPromo(id: string) {
    const p = promoTypes.find((x) => x.id === id);
    setSelectedPromoId(id);
    setDraftTemplate(p?.promptTemplate ?? "");
    setDraftDescription(p?.description ?? "");
    setDirty(false);
    setResult(null);
    setError(null);
  }

  function revert() {
    setDraftTemplate(selected?.promptTemplate ?? "");
    setDraftDescription(selected?.description ?? "");
    setDirty(false);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/super-admin/social-promote/promo-types/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptTemplate: draftTemplate, description: draftDescription }),
    });
    if (res.ok) {
      setSavedAt(new Date());
      setDirty(false);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save changes.");
    }
    setSaving(false);
  }

  async function handleTest() {
    setRunning(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/super-admin/social-promote/test-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platformSlug,
        promoTypeSlug: selected?.slug,
        contextType,
        contextRefId: contextType === "book" ? bookId : null,
        topicText:    contextType === "topic" ? topicText : null,
        overridePromptTemplate: dirty ? draftTemplate : "",
        overrideVoice:          overrideVoice || "",
      }),
    });
    if (res.ok) {
      const body = await res.json();
      setResult(body);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Test generation failed.");
    }
    setRunning(false);
  }

  if (promoTypes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No promo types exist yet. Create one first.</p>
      </div>
    );
  }

  const charsUsed = result?.outputText.length ?? 0;
  const overLimit = result && result.maxChars > 0 && charsUsed > result.maxChars;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: promo type picker */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Promo types</p>
          <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
            {promoTypes.map((p) => (
              <button
                key={p.id}
                onClick={() => pickPromo(p.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  p.id === selectedPromoId
                    ? "bg-purple-50 text-purple-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  {!p.isActive && <span className="text-[10px] text-amber-600 font-medium">OFF</span>}
                </div>
                <div className="text-[11px] text-gray-400 truncate">/{p.slug}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: editor + test panel */}
      {selected && (
        <div className="lg:col-span-9 space-y-6">
          {/* Template editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">/{selected.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {dirty && (
                  <Button variant="ghost" onClick={revert} disabled={saving}>
                    <RotateCcw className="h-4 w-4 mr-1.5" />Revert
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!dirty || saving}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save changes</>}
                </Button>
              </div>
            </div>

            {savedAt && !dirty && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />Saved {savedAt.toLocaleTimeString()}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input
                value={draftDescription}
                onChange={(e) => { setDraftDescription(e.target.value); setDirty(true); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prompt template</label>
              <textarea
                value={draftTemplate}
                onChange={(e) => { setDraftTemplate(e.target.value); setDirty(true); }}
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tokens: <code className="bg-gray-100 px-1 rounded">{"{{book.title}}"}</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{author.displayName}}"}</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{voice}}"}</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{topic}}"}</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{news.title}}"}</code>
              </p>
            </div>
          </div>

          {/* Test live */}
          <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Test live</h3>
              {dirty && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Using unsaved draft
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
                <select value={platformSlug} onChange={(e) => setPlatformSlug(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {platforms.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Context</label>
                <select value={contextType} onChange={(e) => setContextType(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="book">Book</option>
                  <option value="topic">Free-text topic</option>
                </select>
              </div>
            </div>

            {contextType === "book" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Book</label>
                {books.length === 0 ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Your super-admin account has no published books. Add one or switch context to "Free-text topic".
                  </p>
                ) : (
                  <select value={bookId} onChange={(e) => setBookId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                )}
              </div>
            )}

            {contextType === "topic" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                <textarea value={topicText} onChange={(e) => setTopicText(e.target.value)} rows={2} maxLength={800}
                  placeholder="What do you want the post to be about?"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Voice override (optional)</label>
              <input value={overrideVoice} onChange={(e) => setOverrideVoice(e.target.value)} maxLength={500}
                placeholder="Leave blank to use your account's voice description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div className="flex items-center justify-end">
              <Button onClick={handleTest} disabled={running || (contextType === "book" && books.length === 0) || (contextType === "topic" && !topicText.trim())}>
                {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Play className="h-4 w-4 mr-2" />Test live</>}
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{result.modelUsed} · {result.inputTokens}↑ {result.outputTokens}↓ tokens · ${(result.costMicroCents / 1_000_000).toFixed(6)}</span>
                  <span className={overLimit ? "text-red-600 font-medium" : ""}>{charsUsed} / {result.maxChars} chars</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Output</h4>
                  <pre className="whitespace-pre-wrap text-gray-900 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">{result.outputText}</pre>
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">View assembled prompt</summary>
                  <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono leading-relaxed mt-2 max-h-72 overflow-y-auto">{result.assembledPrompt}</pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
