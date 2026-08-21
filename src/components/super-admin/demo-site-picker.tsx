"use client";

import { useState } from "react";
import { Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DemoSiteAuthorOption {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
}

const DEFAULT_DEMO_URL = "https://demo.authorloft.com";

function previewUrlFor(author: DemoSiteAuthorOption | undefined): string {
  if (!author) return DEFAULT_DEMO_URL;
  return author.customDomain ? `https://${author.customDomain}` : `https://${author.slug}.authorloft.com`;
}

export function DemoSitePicker({
  authors,
  initialDemoAuthorId,
}: {
  authors: DemoSiteAuthorOption[];
  initialDemoAuthorId: string | null;
}) {
  const [demoAuthorId, setDemoAuthorId] = useState(initialDemoAuthorId ?? "");
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const selectedAuthor = authors.find((a) => a.id === demoAuthorId);
  const previewUrl = previewUrlFor(selectedAuthor);

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/super-admin/marketing/demo-site", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ demoAuthorId: demoAuthorId || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setSuccess(true);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Demo site</label>
        <select
          value={demoAuthorId}
          onChange={(e) => { setDemoAuthorId(e.target.value); setSuccess(false); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="">Default (demo.authorloft.com)</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} ({author.slug})
            </option>
          ))}
        </select>
      </div>

      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600"
      >
        <ExternalLink className="h-3 w-3" />
        {previewUrl}
      </a>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : <><Check className="h-3.5 w-3.5 mr-1.5" />Save</>}
        </Button>
      </div>

      {success && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="h-4 w-4" /> Saved — the homepage and footer "Demo" links now point here.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-gray-400">
        Controls where the homepage "See a demo author site" button and the footer "Demo" link send visitors.
      </p>
    </div>
  );
}
