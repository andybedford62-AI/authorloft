"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Lock, Check, Loader2, Copy, RefreshCw, AlertTriangle,
  ChevronDown, ChevronUp, Mic, ShieldAlert, ArrowRight, BookOpen, Pencil, X, Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthorPromoteContext } from "@/lib/social-promote/author-context";

type ContextType = "book" | "news" | "topic" | "";

type GenResult = {
  postId: string;
  outputText: string;
  maxChars: number;
  platform: { slug: string; name: string; hashtagStyle: string };
  promoType: { slug: string; name: string };
};

export function PromotePanel({ context: ctx }: { context: AuthorPromoteContext }) {
  // ── Free / disabled gates ────────────────────────────────────────────────
  if (!ctx.planAllowed) return <UpgradeCard />;
  if (!ctx.enabled)     return <UnavailableCard reason="Social Promote is temporarily unavailable. Please check back soon." />;
  if (ctx.costCeilingHit) return <UnavailableCard reason="Today's platform-wide cost ceiling has been reached. The generator will resume tomorrow." />;

  return <Flow context={ctx} />;
}

function Flow({ context: ctx }: { context: AuthorPromoteContext }) {
  const router = useRouter();
  const [voice, setVoice] = useState<string>(ctx.voice ?? "");
  const [savingVoice, setSavingVoice] = useState(false);
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(!ctx.voice);

  // No defaults — every selection is deliberate to prevent accidental token burn.
  const [contextType, setContextType] = useState<ContextType>("");
  const [bookId, setBookId] = useState<string>("");
  const [newsId, setNewsId] = useState<string>("");
  const [topicText, setTopicText] = useState<string>("");
  const [platformSlug, setPlatformSlug] = useState<string>("");
  const [promoTypeSlug, setPromoTypeSlug] = useState<string>("");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removedHashtags, setRemovedHashtags] = useState<Set<string>>(new Set());

  const atDailyLimit   = ctx.todayCount >= ctx.dailyLimit;
  const atMonthlyLimit = ctx.monthCount >= ctx.monthlyLimit;
  const atLimit = atDailyLimit || atMonthlyLimit;

  // Filter promo types down to those applicable to the current context + platform
  const eligiblePromoTypes = useMemo(() => {
    if (!contextType || !platformSlug) return [];
    return ctx.promoTypes.filter((t) => {
      const ctxOk      = t.applicableContexts.length === 0  || t.applicableContexts.includes(contextType);
      const platformOk = t.applicablePlatforms.length === 0 || t.applicablePlatforms.includes(platformSlug);
      return ctxOk && platformOk;
    });
  }, [ctx.promoTypes, contextType, platformSlug]);

  // Step completion state
  const step1Done =
    contextType === "book"  ? !!bookId
  : contextType === "news"  ? !!newsId
  : contextType === "topic" ? topicText.trim().length > 0
  : false;
  const step2Done = step1Done && !!platformSlug;
  const step3Done = step2Done && !!promoTypeSlug;

  // Selection summaries for collapsed/completed steps
  const selectedBook     = ctx.books.find((b) => b.id === bookId);
  const selectedNews     = ctx.newsPosts.find((n) => n.id === newsId);
  const selectedPlatform = ctx.platforms.find((p) => p.slug === platformSlug);
  const selectedPromo    = ctx.promoTypes.find((t) => t.slug === promoTypeSlug);

  function reset() {
    setContextType(""); setBookId(""); setNewsId(""); setTopicText("");
    setPlatformSlug(""); setPromoTypeSlug("");
    setResult(null); setError(null);
  }

  // What's missing — used for the disabled-button tooltip
  const missing: string[] = [];
  if (!step1Done) missing.push("pick what the post is about");
  if (!step2Done) missing.push("pick a platform");
  if (!step3Done) missing.push("pick a promo type");
  const disabledReason = atLimit
    ? (atDailyLimit ? "You've used today's generations" : "You've used this month's generations")
    : missing.length > 0 ? `Still need to: ${missing.join(", ")}` : "";

  // Reset promo type if current selection becomes ineligible
  useMemo(() => {
    if (promoTypeSlug && !eligiblePromoTypes.some((t) => t.slug === promoTypeSlug)) {
      setPromoTypeSlug("");
    }
  }, [eligiblePromoTypes, promoTypeSlug]);

  async function saveVoice() {
    setSavingVoice(true);
    const res = await fetch("/api/admin/social-voice", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ voice }),
    });
    if (res.ok) {
      setVoiceSaved(true);
      setTimeout(() => setVoiceSaved(false), 2000);
      router.refresh();
    }
    setSavingVoice(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResult(null);
    setCopied(false);
    const res = await fetch("/api/social-promote/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        platformSlug,
        promoTypeSlug,
        contextType,
        contextRefId:
            contextType === "book" ? bookId
          : contextType === "news" ? newsId
          : null,
        topicText:    contextType === "topic" ? topicText : null,
      }),
    });
    if (res.ok) {
      const body = await res.json();
      setResult(body);
      setRemovedHashtags(new Set());
      router.refresh();   // re-pull usage counts
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Generation failed. Please try again.");
    }
    setGenerating(false);
  }

  // ── Hashtag handling ───────────────────────────────────────────────────
  // Extract every #tag from the raw output. Order-preserved, de-duplicated.
  const allHashtags = useMemo(() => {
    if (!result) return [] as string[];
    const seen = new Set<string>();
    const list: string[] = [];
    const re = /#[A-Za-z0-9_]+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(result.outputText)) !== null) {
      const tag = m[0];
      if (!seen.has(tag.toLowerCase())) { seen.add(tag.toLowerCase()); list.push(tag); }
    }
    return list;
  }, [result]);

  // Final text after applying removals — collapse extra spaces and trim trailing whitespace lines.
  const displayedText = useMemo(() => {
    if (!result) return "";
    if (removedHashtags.size === 0) return result.outputText;
    let txt = result.outputText;
    for (const tag of removedHashtags) {
      // Remove leading whitespace + the tag (case-insensitive, word-boundary safe).
      const re = new RegExp(`\\s*${tag.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "gi");
      txt = txt.replace(re, "");
    }
    // Tidy: collapse 3+ blank lines to 2, trim trailing whitespace per line, trim ends.
    return txt.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }, [result, removedHashtags]);

  function toggleHashtag(tag: string) {
    setRemovedHashtags((prev) => {
      const next = new Set(prev);
      const key = tag.toLowerCase();
      // Store the original-case version when adding; check lowercase for membership.
      const existing = Array.from(next).find((t) => t.toLowerCase() === key);
      if (existing) next.delete(existing); else next.add(tag);
      return next;
    });
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(displayedText);
      setCopied(true);
      // Mark on server (drives copy-rate success metric)
      await fetch(`/api/social-promote/copied/${result.postId}`, { method: "POST" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy. Select the text manually and copy.");
    }
  }

  const charsUsed = displayedText.length;
  const overLimit = result && result.maxChars > 0 && charsUsed > result.maxChars;
  const isRemoved = (tag: string) => Array.from(removedHashtags).some((t) => t.toLowerCase() === tag.toLowerCase());

  const canGenerate =
    !!platformSlug &&
    !!promoTypeSlug &&
    !atLimit &&
    (contextType === "book"  ? !!bookId
   : contextType === "news"  ? !!newsId
   : topicText.trim().length > 0);

  return (
    <div className="space-y-3">
      {/* Usage chip */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-purple-900">
          <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <span><span className="font-semibold">{ctx.todayCount}</span> of {ctx.dailyLimit} today · <span className="font-semibold">{ctx.monthCount}</span> of {ctx.monthlyLimit} this month</span>
        </div>
        {atLimit && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Limit reached
          </span>
        )}
      </div>

      {/* Voice card */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setVoiceOpen(!voiceOpen)}
          className="w-full px-3 py-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-900">Your voice</span>
            <span className="text-xs text-gray-500">
              {ctx.voice ? "· active" : "· optional — describe how your posts should sound"}
            </span>
          </div>
          {voiceOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {voiceOpen && (
          <div className="px-3 pb-3 space-y-2">
            <textarea
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. Warm and conversational, occasionally playful. Avoid emoji."
              className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{voice.length} / 500</p>
              <div className="flex items-center gap-2">
                {voiceSaved && <span className="text-xs text-green-700 inline-flex items-center gap-1"><Check className="h-3 w-3" />Saved</span>}
                <Button onClick={saveVoice} disabled={savingVoice}>
                  {savingVoice ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save voice</>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Step 1: Context ───────────────────────────────────────────────── */}
      <StepCard
        n={1}
        title="What's the post about?"
        status={step1Done ? "complete" : "active"}
        summary={
          step1Done && contextType === "book" && selectedBook
            ? `📖 ${selectedBook.title}`
            : step1Done && contextType === "news" && selectedNews
            ? `📰 ${selectedNews.title}`
            : step1Done && contextType === "topic"
            ? `✏️ Topic: ${topicText.trim().slice(0, 80)}${topicText.length > 80 ? "…" : ""}`
            : null
        }
      >
        <div className="grid grid-cols-3 gap-2">
          <ContextChoice
            icon={BookOpen}
            label="One of your books"
            hint={ctx.books.length === 0 ? "Add a published book first" : `${ctx.books.length} available`}
            selected={contextType === "book"}
            disabled={ctx.books.length === 0}
            onClick={() => { setContextType("book"); setBookId(""); setNewsId(""); setTopicText(""); setPromoTypeSlug(""); }}
          />
          <ContextChoice
            icon={Newspaper}
            label="AuthorLoft News"
            hint={ctx.newsPosts.length === 0 ? "No news posts yet" : `${ctx.newsPosts.length} recent`}
            selected={contextType === "news"}
            disabled={ctx.newsPosts.length === 0}
            onClick={() => { setContextType("news"); setBookId(""); setNewsId(""); setTopicText(""); setPromoTypeSlug(""); }}
          />
          <ContextChoice
            icon={Pencil}
            label="Something else"
            hint="Free-text topic"
            selected={contextType === "topic"}
            onClick={() => { setContextType("topic"); setBookId(""); setNewsId(""); setPromoTypeSlug(""); }}
          />
        </div>

        {contextType === "book" && ctx.books.length > 0 && (
          <div className="mt-3 p-3 rounded-md bg-purple-50/40 border border-purple-100">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Which book? <span className="text-red-500">*</span>
            </label>
            <select
              value={bookId}
              onChange={(e) => { setBookId(e.target.value); setPromoTypeSlug(""); }}
              className="w-full border border-purple-200 rounded-md px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">— Pick one of your books —</option>
              {ctx.books.map((b) => (
                <option key={b.id} value={b.id}>{b.title}{b.subtitle ? ` — ${b.subtitle}` : ""}</option>
              ))}
            </select>
          </div>
        )}

        {contextType === "news" && ctx.newsPosts.length > 0 && (
          <div className="mt-3 p-3 rounded-md bg-purple-50/40 border border-purple-100">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Which news post? <span className="text-red-500">*</span>
            </label>
            <select
              value={newsId}
              onChange={(e) => { setNewsId(e.target.value); setPromoTypeSlug(""); }}
              className="w-full border border-purple-200 rounded-md px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">— Pick a news post —</option>
              {ctx.newsPosts.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Use the latest AuthorLoft News to drive engagement.</p>
          </div>
        )}

        {contextType === "topic" && (
          <div className="mt-3 p-3 rounded-md bg-purple-50/40 border border-purple-100">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              What's the topic? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={topicText}
              onChange={(e) => { setTopicText(e.target.value); setPromoTypeSlug(""); }}
              rows={2}
              maxLength={800}
              placeholder="e.g. Why I write underwater thrillers, or — finally hit 500 reviews on book one!"
              className="w-full border border-purple-200 rounded-md px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">{topicText.length} / 800</p>
          </div>
        )}
      </StepCard>

      {/* ── Step 2: Platform ──────────────────────────────────────────────── */}
      <StepCard
        n={2}
        title="Where will you post it?"
        status={!step1Done ? "pending" : step2Done ? "complete" : "active"}
        summary={step2Done && selectedPlatform ? `📣 ${selectedPlatform.name}` : null}
        showContent={step1Done}
      >
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {ctx.platforms.map((p) => (
            <PlatformTile
              key={p.slug}
              platform={p}
              selected={platformSlug === p.slug}
              onClick={() => { if (p.accessible) { setPlatformSlug(p.slug); setPromoTypeSlug(""); } }}
            />
          ))}
        </div>
      </StepCard>

      {/* ── Step 3: Promo Type ────────────────────────────────────────────── */}
      <StepCard
        n={3}
        title="What kind of post?"
        status={!step2Done ? "pending" : step3Done ? "complete" : "active"}
        summary={step3Done && selectedPromo ? `🎯 ${selectedPromo.name}` : null}
        showContent={step2Done}
      >
        {eligiblePromoTypes.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
            No promo types fit this context + platform combination. Try a different platform.
          </p>
        ) : (
          <div className="space-y-2">
            <select
              value={promoTypeSlug}
              onChange={(e) => setPromoTypeSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">— Pick a promo type ({eligiblePromoTypes.length} available) —</option>
              {eligiblePromoTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}{t.description ? ` — ${t.description}` : ""}
                </option>
              ))}
            </select>
            {selectedPromo?.description && (
              <p className="text-xs text-gray-600 px-1">{selectedPromo.description}</p>
            )}
          </div>
        )}
      </StepCard>

      {/* ── Generate ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500 flex-1 min-w-0">
          {error ? (
            <span className="text-red-700 inline-flex items-start gap-1.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </span>
          ) : disabledReason ? (
            <span className="text-gray-500 text-xs">{disabledReason}</span>
          ) : (
            <span className="text-gray-700 text-sm">All set — click <strong>Generate</strong> to create your post.</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(step1Done || step2Done || step3Done) && (
            <Button variant="ghost" onClick={reset} disabled={generating}>
              Start over
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!step3Done || atLimit || generating}
            title={disabledReason || undefined}
          >
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4 mr-2" />Generate post</>}
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border border-purple-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Your post</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {result.promoType.name} · {result.platform.name}
              </p>
            </div>
            <div className={`text-xs font-medium ${overLimit ? "text-red-600" : "text-gray-500"}`}>
              {charsUsed} / {result.maxChars} characters
            </div>
          </div>

          <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-md p-3 text-sm text-gray-900 font-sans">
            {displayedText}
          </pre>

          {allHashtags.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 mb-1.5">Hashtags — click to remove or restore:</p>
              <div className="flex flex-wrap gap-1.5">
                {allHashtags.map((tag) => {
                  const removed = isRemoved(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleHashtag(tag)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
                        removed
                          ? "bg-gray-50 text-gray-400 border-gray-200 line-through hover:bg-gray-100"
                          : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      }`}
                      title={removed ? "Click to restore" : "Click to remove from post"}
                    >
                      {tag}
                      <X className="h-2.5 w-2.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {overLimit && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              Over the {result.platform.name} character limit. Remove some hashtags or generate another angle.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="ghost" onClick={handleGenerate} disabled={generating || atLimit}>
              <RefreshCw className="h-4 w-4 mr-2" />Try another angle
            </Button>
            <Button onClick={handleCopy}>
              {copied ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "complete";

function StepCard({
  n, title, status, summary, showContent = true, children,
}: {
  n: number;
  title: string;
  status: StepStatus;
  summary?: string | null;
  /** If false, only the header row renders (used to collapse pending steps). */
  showContent?: boolean;
  children: React.ReactNode;
}) {
  const badge =
    status === "complete"
      ? <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700"><Check className="h-3.5 w-3.5" /></span>
    : status === "active"
      ? <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold ring-2 ring-purple-50">{n}</span>
    : <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold">{n}</span>;

  const cardCls =
    status === "complete"
      ? "bg-white rounded-lg border border-green-200"
    : status === "active"
      ? "bg-white rounded-lg border-2 border-purple-200 shadow-sm"
    : "bg-gray-50 rounded-lg border border-gray-200 opacity-70";

  const titleCls = status === "pending" ? "text-gray-400" : "text-gray-900";

  return (
    <div className={cardCls}>
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {badge}
          <h3 className={`text-sm font-semibold ${titleCls} flex-shrink-0`}>
            Step {n} · {title}
          </h3>
          {summary && (
            <span className="text-sm text-green-700 font-medium ml-auto truncate">{summary}</span>
          )}
        </div>
        {showContent && status !== "pending" && (
          <div className="mt-2.5 pl-8">{children}</div>
        )}
      </div>
    </div>
  );
}

function ContextChoice({
  icon: Icon, label, hint, selected, disabled, onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; hint: string; selected: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200"
          : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${selected ? "text-purple-700" : "text-gray-500"}`} />
        <div className="text-sm font-semibold text-gray-900">{label}</div>
      </div>
      <div className="text-[11px] text-gray-500 mt-0.5">{hint}</div>
    </button>
  );
}

function PlatformTile({
  platform: p, selected, onClick,
}: { platform: AuthorPromoteContext["platforms"][number]; selected: boolean; onClick: () => void }) {
  if (!p.accessible) {
    return (
      <div className="text-left px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-amber-600 flex-shrink-0" />
          <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
        </div>
        <div className="text-[11px] text-amber-700">Premium</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-2.5 py-1.5 rounded-md border transition-colors ${
        selected
          ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200"
          : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
      }`}
    >
      <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
      <div className="text-[11px] text-gray-500">{p.maxChars.toLocaleString()} chars</div>
    </button>
  );
}

function UpgradeCard() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-100 rounded-2xl p-8 text-center">
      <Sparkles className="h-10 w-10 text-purple-500 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-gray-900">Generate posts in your voice</h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
        Social Promote uses your books, news, and voice description to generate ready-to-paste posts for Facebook,
        Instagram, X, LinkedIn, and TikTok. Available on Standard and Premium plans.
      </p>
      <Link href="/admin/settings" className="inline-flex items-center mt-5">
        <Button>
          See plans <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function UnavailableCard({ reason }: { reason: string }) {
  return (
    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-gray-900">Temporarily unavailable</h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">{reason}</p>
    </div>
  );
}
