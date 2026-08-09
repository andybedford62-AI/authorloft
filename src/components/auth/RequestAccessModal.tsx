"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const USAGE_OPTIONS = [
  { value: "Author", label: "Author" },
  { value: "Beta tester", label: "Beta tester" },
  { value: "Just investigating", label: "Just investigating" },
];

export function RequestAccessModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usageType, setUsageType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleClose() {
    setName("");
    setEmail("");
    setUsageType("");
    setSubmitting(false);
    setSent(false);
    setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !usageType) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, usageType }),
      });
      if (!res.ok) throw new Error("send failed");
      setSent(true);
      setTimeout(handleClose, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Request access</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-medium text-gray-900">Request sent!</p>
              <p className="text-sm text-gray-500">We&apos;ll be in touch with your invite code soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">
                Fill in your details and we&apos;ll send you an invite code.
              </p>

              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoFocus
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  How do you plan to use AuthorLoft?
                </label>
                <div className="space-y-2 pt-1">
                  {USAGE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="usageType"
                        value={opt.value}
                        checked={usageType === opt.value}
                        onChange={() => setUsageType(opt.value)}
                        className="h-4 w-4 accent-blue-600"
                        required
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !name || !email || !usageType}
                  className="bg-blue-600 hover:bg-blue-700"
                  style={{ "--accent": "#2563EB" } as React.CSSProperties}
                >
                  {submitting ? "Sending…" : "Send request"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
