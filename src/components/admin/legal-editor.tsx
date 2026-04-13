"use client";

import { useState } from "react";
import { Save, Loader2, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LegalEditorProps {
  initialPrivacy: string;
  privacyUpdatedAt: string | null;
  initialTerms: string;
  termsUpdatedAt: string | null;
  initialContactEmail: string;
}

type Tab = "privacy" | "terms" | "contact";

const textareaClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export function LegalEditor({
  initialPrivacy,
  privacyUpdatedAt,
  initialTerms,
  termsUpdatedAt,
  initialContactEmail,
}: LegalEditorProps) {
  const [activeTab,    setActiveTab]    = useState<Tab>("privacy");
  const [privacy,      setPrivacy]      = useState(initialPrivacy);
  const [terms,        setTerms]        = useState(initialTerms);
  const [contactEmail, setContactEmail] = useState(initialContactEmail);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState<Tab | null>(null);
  const [error,   setError]   = useState("");

  async function handleSave(field: "privacy" | "terms") {
    setSaving(true);
    setError("");
    setSaved(null);
    try {
      const res = await fetch("/api/super-admin/legal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          content: field === "privacy" ? privacy : terms,
        }),
      });
      if (res.ok) {
        setSaved(field);
        setTimeout(() => setSaved(null), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save. Please try again.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveContact() {
    setSaving(true);
    setError("");
    setSaved(null);
    try {
      const res = await fetch("/api/super-admin/legal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail }),
      });
      if (res.ok) {
        setSaved("contact");
        setTimeout(() => setSaved(null), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms",   label: "Terms of Service" },
    { id: "contact", label: "Contact Settings" },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setActiveTab(t.id); setError(""); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Privacy Policy tab ──────────────────────────────────────────── */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">Privacy Policy</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Supports <strong>**bold**</strong> and blank-line paragraph breaks.
                {privacyUpdatedAt && (
                  <> Last published: <span className="font-medium">{new Date(privacyUpdatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></>
                )}
              </p>
            </div>
            <Link href="/privacy" target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:text-blue-700 flex-shrink-0">
              Preview <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Clicking <strong>Publish Privacy Policy</strong> stamps today's date and triggers the
              acknowledgment banner for all visitors who have not yet accepted this version.
            </span>
          </div>

          <textarea
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            rows={28}
            className={textareaClass}
            placeholder="Enter your Privacy Policy text…"
          />

          <div className="flex items-center gap-3">
            <Button onClick={() => handleSave("privacy")} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : saved === "privacy" ? (
                <><Check className="h-4 w-4 mr-2" />Published!</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Publish Privacy Policy</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Terms of Service tab ────────────────────────────────────────── */}
      {activeTab === "terms" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">Terms of Service</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Supports <strong>**bold**</strong> and blank-line paragraph breaks.
                {termsUpdatedAt && (
                  <> Last published: <span className="font-medium">{new Date(termsUpdatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></>
                )}
              </p>
            </div>
            <Link href="/terms" target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:text-blue-700 flex-shrink-0">
              Preview <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Clicking <strong>Publish Terms of Service</strong> stamps today's date and triggers the
              acknowledgment banner for all visitors.
            </span>
          </div>

          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={28}
            className={textareaClass}
            placeholder="Enter your Terms of Service text…"
          />

          <div className="flex items-center gap-3">
            <Button onClick={() => handleSave("terms")} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : saved === "terms" ? (
                <><Check className="h-4 w-4 mr-2" />Published!</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Publish Terms of Service</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Contact Settings tab ────────────────────────────────────────── */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Contact Settings</h2>
          <p className="text-sm text-gray-500">
            The platform contact email is where marketing contact form submissions and system
            notifications will be sent once SMTP is configured.
          </p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Platform Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@authorloft.com"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveContact} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : saved === "contact" ? (
                <><Check className="h-4 w-4 mr-2" />Saved!</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Settings</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
