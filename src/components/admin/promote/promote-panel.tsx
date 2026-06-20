"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Lock, Check, Loader2, Copy, RefreshCw, AlertTriangle,
  ChevronDown, ChevronUp, Mic, ShieldAlert, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthorPromoteContext } from "@/lib/social-promote/author-context";

type ContextType = "book" | "topic";  // "news" deferred to a later session

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

  const [contextType, setContextType] = useState<ContextType>(ctx.books.length > 0 ? "book" : "topic");
  const [bookId, setBookId] = useState<string>(ctx.books[0]?.id ?? "");
  const [topicText, setTopicText] = useState<string>("");

  const [platformSlug, setPlatformSlug] = useState<string>(
    ctx.platforms.find((p) => p.accessible)?.slug ?? ""
  );

  const [promoTypeSlug, setPromoTypeSlug] = useState<string>("");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const atDailyLimit   = ctx.todayCount >= ctx.dailyLimit;
  const atMonthlyLimit = ctx.monthCount >= ctx.monthlyLimit;
  const atLimit = atDailyLimit || atMonthlyLimit;

  // Filter promo types down to those applicable to the current context + platform
  const eligiblePromoTypes = useMemo(() => {
    return ctx.promoTypes.filter((t) => {
      const ctxOk      = t.applicableContexts.length === 0  || t.applicableContexts.includes(contextType);
      const platformOk = t.applicablePlatforms.length === 0 || t.applicablePlatforms.includes(platformSlug);
      return ctxOk && platformOk;
    });
  }, [ctx.promoTypes, contextType, platformSlug]);

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
        contextRefId: contextType === "book"  ? bookId    : null,
        topicText:    contextType === "topic" ? topicText : null,
      }),
    });
    if (res.ok) {
      const body = await res.json();
      setResult(body);
      router.refresh();   // re-pull usage counts
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Generation failed. Please try again.");
    }
    setGenerating(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.outputText);
      setCopied(true);
      // Mark on server (drives copy-rate success metric)
      await fetch(`/api/social-promote/copied/${result.postId}`, { method: "POST" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy. Select the text manually and copy.");
    }
  }

  const charsUsed = result?.outputText.length ?? 0;
  const overLimit = result && result.maxChars > 0 && charsUsed > result.maxChars;

  const canGenerate =
    !!platformSlug &&
    !!promoTypeSlug &&
    !atLimit &&
    (contextType === "book" ? !!bookId : topicText.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Usage chip */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <div className="text-sm text-purple-900">
            <span className="font-semibold">{ctx.todayCount}</span> of {ctx.dailyLimit} generated today,{" "}
            <span className="font-semibold">{ctx.monthCount}</span> of {ctx.monthlyLimit} this month
          </div>
        </div>
        {atLimit && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Limit reached
          </span>
        )}
      </div>

      {/* Voice card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setVoiceOpen(!voiceOpen)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Mic className="h-4 w-4 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Your voice</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {ctx.voice ? "Used to flavor every generation. Click to edit." : "Optional — describe how your posts should sound."}
              </p>
            </div>
          </div>
          {voiceOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {voiceOpen && (
          <div className="px-4 pb-4 space-y-3">
            <textarea
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Warm and conversational, occasionally playful. Avoid emoji. First-person plural when talking about the writing journey."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Main flow */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Step 1: context */}
        <Step n={1} label="What's the post about?">
          <div className="grid grid-cols-2 gap-3">
            <ContextChoice
              label="One of your books"
              hint={ctx.books.length === 0 ? "Add a published book first" : `${ctx.books.length} available`}
              selected={contextType === "book"}
              disabled={ctx.books.length === 0}
              onClick={() => setContextType("book")}
            />
            <ContextChoice
              label="Something else"
              hint="Free-text topic (writing tip, milestone, life)"
              selected={contextType === "topic"}
              onClick={() => setContextType("topic")}
            />
          </div>

          {contextType === "book" && ctx.books.length > 0 && (
            <div className="mt-3">
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ctx.books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}{b.subtitle ? ` — ${b.subtitle}` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {contextType === "topic" && (
            <div className="mt-3">
              <textarea
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                rows={2}
                maxLength={800}
                placeholder="What do you want the post to be about?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">{topicText.length} / 800</p>
            </div>
          )}
        </Step>

        {/* Step 2: platform */}
        <Step n={2} label="Where will you post it?">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ctx.platforms.map((p) => (
              <PlatformTile
                key={p.slug}
                platform={p}
                selected={platformSlug === p.slug}
                onClick={() => p.accessible && setPlatformSlug(p.slug)}
              />
            ))}
          </div>
        </Step>

        {/* Step 3: promo type */}
        <Step n={3} label="What kind of post?">
          {eligiblePromoTypes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No promo types fit this context + platform combination. Try a different platform.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {eligiblePromoTypes.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => setPromoTypeSlug(t.slug)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    promoTypeSlug === t.slug
                      ? "border-purple-300 bg-purple-50/50"
                      : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  {t.description && <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>}
                </button>
              ))}
            </div>
          )}
        </Step>

        {/* Generate button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          {error && (
            <div className="text-sm text-red-700 mr-auto flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {atLimit && !error && (
            <p className="text-sm text-amber-700 mr-auto">
              {atDailyLimit ? "You've used today's generations. Limits reset at midnight UTC." : "You've used this month's generations."}
            </p>
          )}
          <Button onClick={handleGenerate} disabled={!canGenerate || generating}>
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4 mr-2" />Generate post</>}
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Your post</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {result.promoType.name} for {result.platform.name}
              </p>
            </div>
            <div className={`text-xs font-medium ${overLimit ? "text-red-600" : "text-gray-500"}`}>
              {charsUsed} / {result.maxChars} characters
            </div>
          </div>

          <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-900 font-sans">
            {result.outputText}
          </pre>

          {overLimit && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              This post is over the {result.platform.name} character limit. Edit it down before posting, or generate another angle.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
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

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{n}</span>
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

function ContextChoice({
  label, hint, selected, disabled, onClick,
}: { label: string; hint: string; selected: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? "border-purple-300 bg-purple-50/50"
          : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
      }`}
    >
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{hint}</div>
    </button>
  );
}

function PlatformTile({
  platform: p, selected, onClick,
}: { platform: AuthorPromoteContext["platforms"][number]; selected: boolean; onClick: () => void }) {
  if (!p.accessible) {
    return (
      <div className="text-left p-3 rounded-lg border border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-600" />
          <div className="text-sm font-medium text-gray-700">{p.name}</div>
        </div>
        <div className="text-xs text-amber-700 mt-1">Premium plan</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition-colors ${
        selected ? "border-purple-300 bg-purple-50/50" : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
      }`}
    >
      <div className="text-sm font-medium text-gray-900">{p.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">{p.maxChars.toLocaleString()} chars max</div>
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
