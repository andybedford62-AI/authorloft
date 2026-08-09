"use client";

import { useState } from "react";
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  Search,
  ChevronRight,
  Info,
  Zap,
  Shield,
  Save,
  Loader2,
} from "lucide-react";

interface Props {
  sitemapUrl: string;
  baseUrl: string;
  initialGoogle: string;
  initialBing: string;
}

/* ── Reusable copy-to-clipboard hook ─────────────────────────────────────── */

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return { copied, copy };
}

/* ── Step component ──────────────────────────────────────────────────────── */

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <div className="text-sm text-gray-600 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function SearchEnginesClient({
  sitemapUrl,
  baseUrl,
  initialGoogle,
  initialBing,
}: Props) {
  const sitemapCopy = useCopy();
  const urlCopy = useCopy();

  const [google, setGoogle] = useState(initialGoogle);
  const [bing, setBing] = useState(initialBing);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const hasChanges =
    google !== initialGoogle || bing !== initialBing;

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/search-engines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleSiteVerification: google,
          bingSiteVerification: bing,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save verification codes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Your Sitemap ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            Your Sitemap
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your sitemap is automatically generated and kept up to date as you add books, blog posts, and pages.
          </p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex-shrink-0">
              Sitemap URL
            </label>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <code className="flex-1 min-w-0 truncate text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-mono">
                {sitemapUrl}
              </code>
              <button
                onClick={() => sitemapCopy.copy(sitemapUrl)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {sitemapCopy.copied ? (
                  <><Check className="h-4 w-4 text-green-600" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy</>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex-shrink-0">
              Site URL
            </label>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <code className="flex-1 min-w-0 truncate text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-mono">
                {baseUrl}
              </code>
              <button
                onClick={() => urlCopy.copy(baseUrl)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {urlCopy.copied ? (
                  <><Check className="h-4 w-4 text-green-600" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Site Verification ────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Site Verification
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Paste your verification codes below to prove site ownership. Google and Bing will
            provide these during setup — we&apos;ll inject them into your site automatically.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label
              htmlFor="google-verification"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Google Search Console
            </label>
            <input
              id="google-verification"
              type="text"
              value={google}
              onChange={(e) => setGoogle(e.target.value)}
              placeholder="e.g. abc123xyz..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              The value from the <code className="bg-gray-100 px-1 rounded">content</code> attribute
              of the meta tag Google gives you, or the full meta tag — we&apos;ll extract the code.
            </p>
          </div>
          <div>
            <label
              htmlFor="bing-verification"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bing Webmaster Tools
            </label>
            <input
              id="bing-verification"
              type="text"
              value={bing}
              onChange={(e) => setBing(e.target.value)}
              placeholder="e.g. 1234ABCD5678EFGH..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              The value from the <code className="bg-gray-100 px-1 rounded">content</code> attribute
              of the meta tag Bing gives you, or the full meta tag — we&apos;ll extract the code.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="h-4 w-4" /> Save Verification Codes</>
              )}
            </button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Saved — codes are now live on your site
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Google Search Console Guide ──────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#4285F4]" />
            Submit to Google
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Google Search Console lets you monitor how your site appears in Google search results.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <Step number={1} title="Open Google Search Console">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Go to Search Console <ExternalLink className="h-3 w-3" />
            </a>
            {" "}and sign in with your Google account.
          </Step>

          <Step number={2} title="Add your site">
            Click <strong>Add property</strong>, select <strong>URL prefix</strong>, and
            enter your site URL:
            <button
              onClick={() => urlCopy.copy(baseUrl)}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {baseUrl}
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
          </Step>

          <Step number={3} title="Verify ownership">
            Choose the <strong>HTML tag</strong> method. Copy the verification code from the
            meta tag Google provides, paste it in the <strong>Site Verification</strong> section
            above, and click <strong>Save</strong>. Then return to Google and click <strong>Verify</strong>.
          </Step>

          <Step number={4} title="Submit your sitemap">
            In the left sidebar, click <strong>Sitemaps</strong>. Enter your sitemap URL and click <strong>Submit</strong>:
            <button
              onClick={() => sitemapCopy.copy(sitemapUrl)}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {sitemapUrl}
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
          </Step>

          <div className="pt-2">
            <a
              href="https://search.google.com/search-console/sitemaps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Open Google Sitemaps
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Bing Webmaster Tools Guide ───────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#00809D]" />
            Submit to Bing
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Bing Webmaster Tools covers Bing, Yahoo, DuckDuckGo, and other search engines.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <Step number={1} title="Open Bing Webmaster Tools">
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Go to Bing Webmaster Tools <ExternalLink className="h-3 w-3" />
            </a>
            {" "}and sign in with a Microsoft, Google, or Facebook account.
          </Step>

          <Step number={2} title="Add your site (two options)">
            <strong>Quick way:</strong> Click <strong>Import from Google Search Console</strong> to
            pull in your site and sitemap automatically.
            <br />
            <strong>Manual way:</strong> Select <strong>Add your site manually</strong> and enter
            your site URL.
          </Step>

          <Step number={3} title="Verify ownership (manual only)">
            Choose the <strong>HTML Meta Tag</strong> method. Copy the verification code, paste
            it in the <strong>Site Verification</strong> section above, and click <strong>Save</strong>.
            Then return to Bing and click <strong>Verify</strong>.
          </Step>

          <Step number={4} title="Submit your sitemap">
            Go to <strong>Sitemaps</strong> in the left menu, click <strong>Submit sitemap</strong>,
            and enter:
            <button
              onClick={() => sitemapCopy.copy(sitemapUrl)}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {sitemapUrl}
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
          </Step>

          <div className="pt-2">
            <a
              href="https://www.bing.com/webmasters/sitemaps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Open Bing Sitemaps
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Automatic Submissions ────────────────────────────────────────── */}
      <section className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
        <div className="p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Automatic Submissions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            AuthorLoft automatically notifies search engines whenever you publish or update a blog
            post using the <strong>IndexNow</strong> protocol. This means Bing, Yandex, and other
            participating engines will discover your new content within minutes — no action needed
            from you.
          </p>
          <div className="mt-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              Google does not currently participate in IndexNow but discovers content through your
              sitemap and its own crawling. Submitting your sitemap to Google (above) is the best
              way to ensure fast indexing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
