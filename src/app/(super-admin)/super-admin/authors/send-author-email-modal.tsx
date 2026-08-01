"use client";

import { useState } from "react";
import { X, Send, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailComposer } from "@/components/super-admin/email-composer";

interface AuthorTarget {
  id:          string;
  name:        string;
  displayName: string | null;
  email:       string;
}

export function SendAuthorEmailModal({ author, onClose }: { author: AuthorTarget; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const firstName = (author.displayName || author.name).split(" ")[0];

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/super-admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, broadcastBody: body, authorId: author.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Send failed");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email {author.displayName || author.name}</h3>
              <p className="text-xs text-gray-400">{author.email} &middot; replies go to the address set in Settings → Mass Email</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {sent ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 inline-block">
                Sent to {author.email}.
              </p>
              <div>
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <>
              <EmailComposer
                subject={subject}
                body={body}
                onSubjectChange={setSubject}
                onBodyChange={setBody}
                bodyPlaceholder={`Hi ${firstName},\n\nYour message here…\n\n— Andy, AuthorLoft`}
                disabled={sending}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center gap-2">
                <Button onClick={handleSend} disabled={sending}>
                  {sending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                    : <><Send className="h-4 w-4 mr-2" />Send to {firstName}</>}
                </Button>
                <Button variant="ghost" onClick={onClose} disabled={sending}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
