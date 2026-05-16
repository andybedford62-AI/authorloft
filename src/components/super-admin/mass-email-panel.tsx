"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, History, Users, BookmarkPlus, FolderOpen, Trash2 } from "lucide-react";

type AudienceFilter = "ALL" | "FREE" | "STANDARD" | "PREMIUM";

interface Broadcast {
  id:             string;
  subject:        string;
  audienceFilter: string;
  recipientCount: number;
  sentAt:         string;
}

interface Template {
  id:        string;
  name:      string;
  subject:   string;
  body:      string;
  updatedAt: string;
}

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string }[] = [
  { value: "ALL",      label: "All Authors"     },
  { value: "FREE",     label: "Free Plan Only"  },
  { value: "STANDARD", label: "Standard Plan"   },
  { value: "PREMIUM",  label: "Premium Plan"    },
];

export function MassEmailPanel() {
  const [subject,      setSubject]      = useState("");
  const [body,         setBody]         = useState("");
  const [audience,     setAudience]     = useState<AudienceFilter>("ALL");
  const [count,        setCount]        = useState<number | null>(null);
  const [sending,      setSending]      = useState(false);
  const [result,       setResult]       = useState<{ sent: number; failed: number } | null>(null);
  const [error,        setError]        = useState("");
  const [history,        setHistory]        = useState<Broadcast[]>([]);
  const [loadingHistory, setLoadingHistory]  = useState(true);
  const [templates,      setTemplates]       = useState<Template[]>([]);
  const [showSaveModal,  setShowSaveModal]   = useState(false);
  const [templateName,   setTemplateName]    = useState("");
  const [savingTemplate, setSavingTemplate]  = useState(false);
  const [showTemplates,  setShowTemplates]   = useState(false);

  function loadTemplates() {
    fetch("/api/super-admin/broadcast-templates")
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => {});
  }

  // Load broadcast history + templates
  useEffect(() => {
    fetch("/api/super-admin/broadcasts")
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
    loadTemplates();
  }, []);

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      await fetch("/api/super-admin/broadcast-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), subject, body }),
      });
      loadTemplates();
      setShowSaveModal(false);
      setTemplateName("");
    } catch {}
    finally { setSavingTemplate(false); }
  }

  function loadTemplate(t: Template) {
    setSubject(t.subject);
    setBody(t.body);
    setShowTemplates(false);
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/super-admin/broadcast-templates/${id}`, { method: "DELETE" });
    loadTemplates();
  }

  // Live recipient count when audience changes
  useEffect(() => {
    setCount(null);
    fetch(`/api/super-admin/broadcasts?count=1&filter=${audience}`)
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => setCount(null));
  }, [audience]);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    if (!confirm(`Send to ${count ?? "?"} authors (${audience})? This cannot be undone.`)) return;

    setSending(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/super-admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, broadcastBody: body, audienceFilter: audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setResult({ sent: data.sent, failed: data.failed });
      setSubject("");
      setBody("");
      // Refresh history
      fetch("/api/super-admin/broadcasts").then(r => r.json()).then(setHistory).catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Compose */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-gray-400" />
            New Broadcast
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Load template {templates.length > 0 && `(${templates.length})`}
            </button>
            <button
              onClick={() => { setTemplateName(""); setShowSaveModal(true); }}
              disabled={!subject.trim() && !body.trim()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 disabled:opacity-40 transition-colors"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save as template
            </button>
          </div>
        </div>

        {/* Template list */}
        {showTemplates && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-3">No saved templates yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {templates.map(t => (
                  <li key={t.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                    <button onClick={() => loadTemplate(t)} className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.subject}</p>
                    </button>
                    <button onClick={() => deleteTemplate(t.id)} className="ml-3 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Save template modal */}
        {showSaveModal && (
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-purple-900">Save as template</p>
            <input
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Template name (e.g. Monthly Update)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {savingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                Save
              </button>
              <button onClick={() => setShowSaveModal(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Send an announcement, offer, or update to your authors. An unsubscribe link is automatically included.
          Use <code className="bg-gray-100 px-1 rounded text-xs">{"{{firstName}}"}</code> to personalise.
        </p>

        {/* Audience */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Audience</label>
          <div className="flex items-center gap-3">
            <select
              value={audience}
              onChange={e => setAudience(e.target.value as AudienceFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {AUDIENCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-4 w-4 text-gray-400" />
              {count === null ? "Counting…" : `${count.toLocaleString()} recipient${count !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Email subject…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Body (plain text)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            placeholder={`Hi {{firstName}},\n\nYour message here…\n\n— The AuthorLoft Team`}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Sent to {result.sent.toLocaleString()} author{result.sent !== 1 ? "s" : ""}.
            {result.failed > 0 && ` ${result.failed} failed.`}
          </p>
        )}

        <button
          onClick={handleSend}
          disabled={sending || count === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending…" : `Send to ${count ?? "?"} authors`}
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <History className="h-4 w-4 text-gray-400" />
          Broadcast History
        </h2>
        {loadingHistory ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">No broadcasts sent yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Audience</th>
                <th className="pb-2 font-medium text-right">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(b => (
                <tr key={b.id} className="text-gray-700">
                  <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(b.sentAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 pr-4 max-w-[240px] truncate">{b.subject}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {b.audienceFilter}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium">{b.recipientCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
