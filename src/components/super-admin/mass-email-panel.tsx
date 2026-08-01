"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, History, Users, Reply, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailComposer } from "./email-composer";
import { useActiveSupportEmails } from "./use-active-support-emails";

type AudienceFilter = "ALL" | "FREE" | "STANDARD" | "PREMIUM";

interface Broadcast {
  id:                string;
  subject:           string;
  audienceFilter:    string;
  recipientCount:    number;
  recipientEmail:    string | null;
  sentAt:            string;
}

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string }[] = [
  { value: "ALL",      label: "All Authors"     },
  { value: "FREE",     label: "Free Plan Only"  },
  { value: "STANDARD", label: "Standard Plan"   },
  { value: "PREMIUM",  label: "Premium Plan"    },
];

export function MassEmailPanel({ initialReplyToEmail }: { initialReplyToEmail: string | null }) {
  const [subject,      setSubject]      = useState("");
  const [body,         setBody]         = useState("");
  const [audience,     setAudience]     = useState<AudienceFilter>("ALL");
  const [count,        setCount]        = useState<number | null>(null);
  const [sending,      setSending]      = useState(false);
  const [result,       setResult]       = useState<{ sent: number; failed: number } | null>(null);
  const [error,        setError]        = useState("");
  const [history,        setHistory]        = useState<Broadcast[]>([]);
  const [loadingHistory, setLoadingHistory]  = useState(true);

  const { emails: supportEmails, loading: loadingSupportEmails } = useActiveSupportEmails();
  const [replyToEmail,   setReplyToEmail]   = useState(initialReplyToEmail ?? "");
  const [savingReplyTo,  setSavingReplyTo]  = useState(false);
  const [replyToSaved,   setReplyToSaved]   = useState(false);

  async function handleSaveReplyTo() {
    setSavingReplyTo(true);
    setReplyToSaved(false);
    try {
      await fetch("/api/super-admin/author-reply-to", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorReplyToEmail: replyToEmail.trim() }),
      });
      setReplyToSaved(true);
      setTimeout(() => setReplyToSaved(false), 2500);
    } catch {}
    finally { setSavingReplyTo(false); }
  }

  function loadHistory() {
    fetch("/api/super-admin/broadcasts").then(r => r.json()).then(setHistory).catch(() => {});
  }

  useEffect(() => {
    loadHistory();
    setLoadingHistory(false);
  }, []);

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
      loadHistory();
    } catch (err: any) {
      setError(err.message || "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Reply-to address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Reply className="h-4 w-4 text-gray-400" />
          Reply-To Address
        </h2>
        <p className="text-sm text-gray-500">
          Where author replies land — for both individual and mass emails. Emails still send from{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">hello@authorloft.com</code> (required for
          deliverability), but hitting Reply routes here instead. Choose from{" "}
          <a href="/super-admin/settings" className="text-purple-600 hover:underline">Settings → Email Addresses</a> —
          only active ones are listed.
        </p>
        <div className="flex items-center gap-2">
          <select
            value={replyToEmail}
            onChange={e => setReplyToEmail(e.target.value)}
            disabled={loadingSupportEmails}
            className="flex-1 max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
          >
            <option value="">
              {loadingSupportEmails ? "Loading…" : "— None selected —"}
            </option>
            {supportEmails.map(e => (
              <option key={e.id} value={e.email}>{e.label} — {e.email}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleSaveReplyTo} disabled={savingReplyTo}>
            {savingReplyTo
              ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
              : replyToSaved
                ? <><Check className="h-3.5 w-3.5 mr-1.5" />Saved</>
                : "Save"}
          </Button>
        </div>
        {!loadingSupportEmails && supportEmails.length === 0 && (
          <p className="text-xs text-amber-600">
            No active email addresses yet — add one in{" "}
            <a href="/super-admin/settings" className="underline">Settings → Email Addresses</a> first.
          </p>
        )}
      </div>

      {/* Compose */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Send className="h-4 w-4 text-gray-400" />
          New Broadcast
        </h2>
        <p className="text-sm text-gray-500 -mt-3">
          Send an announcement, offer, or update to a segment of your authors. An unsubscribe link is
          automatically included. For a personal one-to-one note, use the mail icon on an author's row
          in <a href="/super-admin/authors" className="text-purple-600 hover:underline">All Authors</a> instead.
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

        <EmailComposer
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Sent to {result.sent.toLocaleString()} author{result.sent !== 1 ? "s" : ""}.
            {result.failed > 0 && ` ${result.failed} failed.`}
          </p>
        )}

        <Button onClick={handleSend} disabled={sending || count === 0}>
          {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : <><Send className="h-4 w-4 mr-2" />{`Send to ${count ?? "?"} authors`}</>}
        </Button>
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
                    {b.audienceFilter === "INDIVIDUAL" ? (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {b.recipientEmail ?? "Individual"}
                      </span>
                    ) : (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        {b.audienceFilter}
                      </span>
                    )}
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
