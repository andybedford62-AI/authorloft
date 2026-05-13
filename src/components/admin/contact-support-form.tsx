"use client";

import { useState } from "react";
import { Send, Check, Mail } from "lucide-react";

type SupportEmailOption = { id: string; label: string; email: string; description: string | null };

type Props = {
  authorName: string;
  authorEmail: string;
  supportEmails: SupportEmailOption[];
};

export function ContactSupportForm({ authorName, authorEmail, supportEmails }: Props) {
  const [supportEmailId, setSupportEmailId] = useState(supportEmails[0]?.id ?? "");
  const [subject,        setSubject]        = useState("");
  const [message,        setMessage]        = useState("");
  const [sending,        setSending]        = useState(false);
  const [sent,           setSent]           = useState(false);
  const [routedTo,       setRoutedTo]       = useState<string | null>(null);
  const [error,          setError]          = useState("");

  const selectedEmail = supportEmails.find((e) => e.id === supportEmailId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supportEmailId: supportEmailId || null, subject, message }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutedTo(data.routedTo ?? null);
        setSent(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
        <p className="text-gray-500 mb-1">
          We'll get back to you at <strong>{authorEmail}</strong>.
        </p>
        {routedTo && (
          <p className="text-sm text-gray-400 mb-6">
            Routed to{selectedEmail ? ` ${selectedEmail.label} (` : " "}<strong>{routedTo}</strong>{selectedEmail ? ")" : ""}.
          </p>
        )}
        <button
          onClick={() => { setSent(false); setSubject(""); setMessage(""); }}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Read-only author info */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Your name</label>
          <input value={authorName} disabled className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Your email</label>
          <input value={authorEmail} disabled className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
        </div>
      </div>

      {supportEmails.length > 0 && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Inquiry type <span className="text-red-500">*</span>
          </label>
          <select
            value={supportEmailId}
            onChange={(e) => setSupportEmailId(e.target.value)}
            className={inputCls}
          >
            {supportEmails.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {selectedEmail?.description && (
            <p className="text-xs text-gray-400 mt-1">{selectedEmail.description}</p>
          )}
          {selectedEmail && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3" />
              Routes to <span className="font-medium text-gray-500">{selectedEmail.email}</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your question or issue"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          placeholder="Describe your question or issue in as much detail as helpful…"
          required
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {sending ? "Sending…" : <><Send className="h-4 w-4" /> Send Message</>}
      </button>
    </form>
  );
}
