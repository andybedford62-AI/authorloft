"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Send, Check, Mail } from "lucide-react";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";

type SupportEmailOption = { id: string; label: string; email: string; description: string | null };

export function ContactForm() {
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [supportEmailId,  setSupportEmailId]  = useState("");
  const [subject,         setSubject]         = useState("");
  const [message,         setMessage]         = useState("");
  const [sending,         setSending]         = useState(false);
  const [sent,            setSent]            = useState(false);
  const [error,           setError]           = useState("");
  const [supportEmails,   setSupportEmails]   = useState<SupportEmailOption[]>([]);

  useEffect(() => {
    fetch("/api/public/support-emails")
      .then((r) => r.json())
      .then((data) => {
        setSupportEmails(data);
        if (data.length > 0) setSupportEmailId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedEmail = supportEmails.find((e) => e.id === supportEmailId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/marketing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, supportEmailId: supportEmailId || null, subject, message }),
      });

      if (res.ok) {
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

  const inputClass =
    "w-full border border-[rgba(243,236,219,0.15)] rounded-[6px] px-3 py-2.5 text-sm text-[#f3ecdb] placeholder-[#93a0bc] bg-[#16233d] focus:outline-none focus:ring-2 focus:ring-[#d6a94a] focus:border-transparent";

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingPageHeader
        eyebrow="Get in touch"
        title={<>Contact <span className="italic text-[#d6a94a]">AuthorLoft</span></>}
        subtitle="Have a question about our plans, need help with your account, or just want to say hello? Fill out the form and we'll get back to you within one business day."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {sent ? (
          <div className="bg-[#1e2f4d] border border-[rgba(243,236,219,0.12)] rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#243756] flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-[#d6a94a]" />
            </div>
            <h2 className="text-xl font-bold text-[#f3ecdb] mb-2">Message sent!</h2>
            <p className="text-[#93a0bc] mb-2">
              Thanks for reaching out. We&apos;ll get back to you at <strong>{email}</strong> within one business day.
            </p>
            {selectedEmail && (
              <p className="text-sm text-[#93a0bc] mb-6">
                Your message was routed to <strong>{selectedEmail.label}</strong> ({selectedEmail.email}).
              </p>
            )}
            <p className="text-sm text-[#93a0bc] mb-5">While you wait, explore what AuthorLoft can do for your author career:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link href="/features" className="px-4 py-2 rounded-[6px] bg-[#d6a94a] text-[#16233d] text-sm font-semibold hover:bg-[#e2bc6e] transition-colors">
                Explore features →
              </Link>
              <Link href="/pricing" className="px-4 py-2 rounded-[6px] border border-[rgba(243,236,219,0.15)] text-[#f3ecdb] text-sm font-semibold hover:bg-[rgba(243,236,219,0.06)] transition-colors">
                View pricing plans
              </Link>
            </div>
            <Link href="/" className="text-sm text-[#93a0bc] hover:text-[#f3ecdb] transition-colors">
              ← Back to AuthorLoft home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-[#1e2f4d] border border-[rgba(243,236,219,0.12)] rounded-2xl p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="contact-name" className="block text-sm font-medium text-[#f3ecdb]">
                  Your name <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#f3ecdb]">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {supportEmails.length > 0 && (
              <div className="space-y-1">
                <label htmlFor="contact-inquiry" className="block text-sm font-medium text-[#f3ecdb]">
                  Inquiry type <span className="text-red-400">*</span>
                </label>
                <select
                  id="contact-inquiry"
                  value={supportEmailId}
                  onChange={(e) => setSupportEmailId(e.target.value)}
                  className={inputClass}
                >
                  {supportEmails.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                {selectedEmail && (
                  <p className="text-xs text-[#93a0bc] flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    Will be routed to <span className="font-medium text-[#c7cede]">{selectedEmail.email}</span>
                    {selectedEmail.description && <> — {selectedEmail.description}</>}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="contact-subject" className="block text-sm font-medium text-[#f3ecdb]">Subject</label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What can we help you with?"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-message" className="block text-sm font-medium text-[#f3ecdb]">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tell us more…"
                required
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[6px] bg-[#d6a94a] hover:bg-[#e2bc6e] text-[#16233d] text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {sending ? "Sending…" : <><Send className="h-4 w-4" /> Send Message</>}
            </button>
          </form>
        )}

        <div className="mt-10 text-sm text-[#93a0bc] flex gap-6">
          <Link href="/privacy" className="hover:text-[#f3ecdb] transition-colors">Privacy Policy</Link>
          <Link href="/terms"   className="hover:text-[#f3ecdb] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
