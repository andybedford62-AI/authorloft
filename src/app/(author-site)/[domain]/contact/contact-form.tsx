"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  domain:      string;
  accentColor: string;
}

export function ContactForm({ domain, accentColor }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      domain,
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value.trim(),
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value.trim(),
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value.trim() || undefined,
      website: (form.elements.namedItem("website") as HTMLInputElement).value.trim() || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Could not send your message. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const inputClass =
    "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 transition-shadow";

  if (status === "success") {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Message Sent!</h2>
          <p className="text-gray-500 text-sm">
            Thanks for reaching out. You&apos;ll hear back within 24–48 hours.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: accentColor }}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              placeholder="Your name"
              required
              disabled={status === "loading"}
              className={inputClass}
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              className={inputClass}
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            name="subject"
            placeholder="What's this about?"
            disabled={status === "loading"}
            className={inputClass}
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Website <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            name="website"
            type="url"
            placeholder="https://yoursite.com"
            disabled={status === "loading"}
            className={inputClass}
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            name="message"
            rows={5}
            required
            disabled={status === "loading"}
            placeholder="Your message…"
            className={inputClass}
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: accentColor }}
        >
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="h-4 w-4" /> Send Message</>
          )}
        </button>
      </form>
    </div>
  );
}
