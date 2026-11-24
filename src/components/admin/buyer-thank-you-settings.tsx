"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_LENGTH = 1500;

/**
 * Settings → Communications: the author's personal thank-you note, shown to buyers
 * in the order confirmation (books, bundles) and course access (paid) emails.
 */
export function BuyerThankYouSettings() {
  const [message,   setMessage]   = useState("");
  const [saved,     setSaved]     = useState("");   // last saved value, to detect unsaved edits
  const [replyTo,   setReplyTo]   = useState("");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [testing,   setTesting]   = useState(false);
  const [status,    setStatus]    = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/thank-you")
      .then((r) => r.json())
      .then((d) => {
        setMessage(d.message ?? "");
        setSaved(d.message ?? "");
        setReplyTo(d.replyTo ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dirty = message.trim() !== saved.trim();

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings/thank-you", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus({ kind: "error", text: data.error || "Could not save. Please try again." }); return; }
      setSaved(message.trim());
      setStatus({ kind: "ok", text: message.trim() ? "Saved. Buyers will see this note." : "Note removed." });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings/thank-you/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus({ kind: "error", text: data.error || "Could not send the test." }); return; }
      setStatus({ kind: "ok", text: `Test sent to ${data.to}. It can take a minute to arrive.` });
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Buyer thank-you message</h2>
      </div>
      <p className="text-sm text-gray-500">
        A personal note buyers see in their confirmation email after a paid purchase of your
        books, bundles or courses, shown as &ldquo;A note from you&rdquo;. Leave it empty to send no note.
      </p>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); setStatus(null); }}
            rows={6}
            maxLength={MAX_LENGTH}
            placeholder={"Hi {{firstName}}, thank you so much for buying my book. Readers like you make this possible. I'd love to hear what you think when you finish it. Just hit reply."}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Use {"{{firstName}}"} to greet the buyer by name. Line breaks are kept.</span>
            <span>{message.length}/{MAX_LENGTH}</span>
          </div>

          <p className="text-xs text-gray-500">
            When a note is set, buyers&rsquo; replies go to{" "}
            <strong className="text-gray-700">{replyTo || "your account email"}</strong>
            {" "}(your public contact email if you&rsquo;ve set one, otherwise your account email).
            Free downloads and free course enrollments don&rsquo;t include the note.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !dirty}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save</>}
            </Button>
            <Button variant="ghost" onClick={handleTest} disabled={testing || !message.trim()}>
              {testing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : <><Send className="h-4 w-4 mr-2" />Send me a test</>}
            </Button>
            {status && (
              <span className={`text-sm ${status.kind === "ok" ? "text-green-600" : "text-red-600"}`}>{status.text}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
