"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Check, Loader2, RotateCcw, Send, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthorResult {
  id:          string;
  email:       string;
  name:        string;
  displayName: string | null;
  slug:        string;
}

const DEFAULT_SUBJECT = "🎉 Welcome to AuthorLoft — your author site is live!";

const DEFAULT_BODY = `Hi {{firstName}},

Congratulations — your AuthorLoft account is active and your author site is already live on the internet.

Your site: {{siteUrl}}

─── Your first 3 steps ───

1. Add your books — Head to the Books menu and add your first title. Include a cover, description, and buy links.
2. Personalise your site — Upload your author photo, write your bio, and set your accent colour in Appearance.
3. Share your link — Post your site URL on social, add it to your email signature, and tell your readers.

─── When you're ready to grow ───

Your free plan is a great start. Here's what unlocks on Standard ($19.99/mo):
• Sell books directly — Keep more revenue. No middlemen.
• Custom domain — Use your own authorname.com address.
• Up to 20 books — Room to grow your catalog.

And on Premium ($59.99/mo): unlimited books plus full analytics so you can see exactly who's finding you and where they come from.

No pressure — upgrade whenever it makes sense.

Questions? Just reply to this email — we read every one.

— The AuthorLoft Team`;

interface Props {
  initialSubject: string | null;
  initialBody:    string | null;
}

export function WelcomeEmailPanel({ initialSubject, initialBody }: Props) {
  const [subject,    setSubject]    = useState(initialSubject ?? DEFAULT_SUBJECT);
  const [body,       setBody]       = useState(initialBody    ?? DEFAULT_BODY);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");
  const [testEmail,    setTestEmail]    = useState("");
  const [testName,     setTestName]     = useState("");
  const [testSlug,     setTestSlug]     = useState("");
  const [testSending,  setTestSending]  = useState(false);
  const [testSent,     setTestSent]     = useState(false);
  const [testError,    setTestError]    = useState("");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResults, setSearchResults] = useState<AuthorResult[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorResult | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setSelectedAuthor(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/super-admin/authors/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {}
      finally { setSearching(false); }
    }, 300);
  }

  function selectAuthor(author: AuthorResult) {
    setSelectedAuthor(author);
    setTestEmail(author.email);
    setTestName(author.displayName || author.name);
    setTestSlug(author.slug);
    setSearchQuery("");
    setSearchResults([]);
    setTestError("");
  }

  function clearSelection() {
    setSelectedAuthor(null);
    setTestEmail("");
    setTestName("");
    setTestSlug("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/welcome-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ welcomeEmailSubject: subject, welcomeEmailBody: body }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSend() {
    if (!testEmail.trim()) { setTestError("Email address is required."); return; }
    setTestSending(true);
    setTestError("");
    setTestSent(false);
    try {
      const res = await fetch("/api/super-admin/welcome-email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim(), name: testName.trim() || "Test Author", slug: testSlug.trim() || "test-author" }),
      });
      if (!res.ok) throw new Error("Send failed");
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } catch {
      setTestError("Failed to send test email.");
    } finally {
      setTestSending(false);
    }
  }

  function handleReset() {
    if (!confirm("Reset to default content? This will overwrite your current edits.")) return;
    setSubject(DEFAULT_SUBJECT);
    setBody(DEFAULT_BODY);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          Welcome Email
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to default
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Sent from <strong>welcome@authorloft.com</strong> after a new author verifies their email.
        Use <code className="bg-gray-100 px-1 rounded text-xs">{"{{firstName}}"}</code>,{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"{{siteUrl}}"}</code>, and{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"{{dashboardUrl}}"}</code> as variables.
      </p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject line</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Email subject..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Body (plain text)</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={20}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          placeholder="Email body..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
      </div>

      {/* Test send */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-gray-400" />
          Send a test
        </p>
        <p className="text-xs text-gray-500">
          Search for an author to pre-fill their details, or enter an email manually.
        </p>

        {/* Author search */}
        <div className="relative">
          {selectedAuthor ? (
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium text-purple-900">{selectedAuthor.displayName || selectedAuthor.name}</p>
                <p className="text-xs text-purple-600">{selectedAuthor.email} · {selectedAuthor.slug}.authorloft.com</p>
              </div>
              <button onClick={clearSelection} className="text-purple-400 hover:text-purple-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Search by name, email, or slug…"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />}
              </div>
              {searchResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map(author => (
                    <li key={author.id}>
                      <button
                        onClick={() => selectAuthor(author)}
                        className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{author.displayName || author.name}</p>
                        <p className="text-xs text-gray-500">{author.email} · {author.slug}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        {testError && <p className="text-xs text-red-600">{testError}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestSend}
            disabled={testSending}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {testSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {testSending ? "Sending…" : "Send test"}
          </button>
          {testSent && <span className="text-sm text-green-600 font-medium">Sent!</span>}
        </div>
      </div>
    </div>
  );
}
