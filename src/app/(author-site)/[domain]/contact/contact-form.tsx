"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  domain: string;
}

export function ContactForm({ domain }: Props) {
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
      website: (form.elements.namedItem("website") as HTMLInputElement).value.trim() || undefined,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value.trim() || undefined,
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
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  if (status === "success") {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Message Sent!</h2>
          <p className="text-gray-500 text-sm">
            Thanks for reaching out. You&apos;ll hear back within 24–48 hours.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          name="name"
          placeholder="Jane Smith"
          required
          disabled={status === "loading"}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          required
          disabled={status === "loading"}
        />
        <Input
          label="Subject"
          name="subject"
          placeholder="What's this about? (optional)"
          disabled={status === "loading"}
        />
        <Input
          label="Website"
          name="website"
          type="url"
          placeholder="https://yoursite.com (optional)"
          disabled={status === "loading"}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            rows={5}
            required
            disabled={status === "loading"}
            placeholder="What's on your mind?"
            className={inputClass}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "loading"}
          size="lg"
          className="w-full"
        >
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  );
}
