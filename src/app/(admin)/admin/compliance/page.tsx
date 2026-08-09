"use client";

import { useState } from "react";
import { Download, Trash2, Shield, FileJson, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function CompliancePage() {
  const [reason,      setReason]      = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleDeletionRequest() {
    if (!confirm("Are you sure you want to request account deletion? This will notify the platform administrator.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/compliance/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacy &amp; Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your data, exercise your privacy rights, and stay compliant with GDPR and CCPA.
        </p>
      </div>

      {/* What we store */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-800">What data we store about you</h2>
        </div>
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
          <li>Account details — name, email address, profile information</li>
          <li>Your books, blog posts, and custom pages</li>
          <li>Sales orders and transaction history</li>
          <li>Your newsletter subscriber list</li>
          <li>Platform settings and preferences</li>
          <li>Usage logs for security and rate limiting (short-term, not exported)</li>
        </ul>
      </div>

      {/* Export your data */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-green-500" />
          <h2 className="text-sm font-semibold text-gray-800">Export your data</h2>
        </div>
        <p className="text-sm text-gray-600">
          Download a complete copy of all data AuthorLoft holds about your account, including your
          profile, books, orders, and settings in machine-readable JSON format.
        </p>
        <a
          href="/api/admin/compliance/export"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download my data (JSON)
        </a>
      </div>

      {/* Export subscribers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-800">Export subscriber list</h2>
        </div>
        <p className="text-sm text-gray-600">
          Download a CSV of all your newsletter subscribers including name, email, preferences,
          and subscription date. Use this to migrate to another platform or for your own records.
        </p>
        <a
          href="/api/admin/newsletter/export"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download subscribers (CSV)
        </a>
      </div>

      {/* Account deletion */}
      <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-sm font-semibold text-gray-800">Request account deletion</h2>
        </div>

        {submitted ? (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Deletion request submitted</p>
              <p className="mt-1">
                The platform administrator has been notified. Your request will be processed
                within 30 days in accordance with GDPR/CCPA requirements.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Submitting a deletion request will notify the platform administrator to permanently
              delete your account, all your books, orders, and subscriber data. This action
              cannot be undone. Active paid subscriptions must be cancelled first.
            </p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Reason for deletion <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Tell us why you're leaving (optional)…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <button
              onClick={handleDeletionRequest}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />}
              Request account deletion
            </button>
          </>
        )}
      </div>

      {/* GDPR/CCPA info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Your privacy rights</p>
        <p className="text-xs leading-relaxed">
          Under GDPR (EU) and CCPA (California), you have the right to access, correct, port,
          and erase your personal data. AuthorLoft processes your data to provide the platform
          service. Data export requests are fulfilled immediately. Deletion requests are processed
          within 30 days. For questions, contact us via your account settings.
        </p>
      </div>
    </div>
  );
}
