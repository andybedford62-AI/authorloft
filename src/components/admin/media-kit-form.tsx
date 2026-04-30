"use client";

import { useState } from "react";
import { Loader2, Save, Image as ImageIcon, BookOpen, Info } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface MediaKitFormProps {
  initialData: {
    pressTitle:      string | null;
    pressBio:        string | null;
    pressContact:    string | null;
    profileImageUrl: string | null;
    displayName:     string | null;
    name:            string;
  };
}

export function MediaKitForm({ initialData }: MediaKitFormProps) {
  const [pressTitle,   setPressTitle]   = useState(initialData.pressTitle   ?? "");
  const [pressBio,     setPressBio]     = useState(initialData.pressBio     ?? "");
  const [pressContact, setPressContact] = useState(initialData.pressContact ?? "");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/media-kit", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pressTitle, pressBio, pressContact }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Press Biography */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Press Biography</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Your title for press use
          </label>
          <input
            type="text"
            value={pressTitle}
            onChange={(e) => setPressTitle(e.target.value)}
            placeholder="e.g. Author & Business Systems Analyst"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">Shown under your name on the public media kit page.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Press biography
          </label>
          <RichTextEditor
            value={pressBio}
            onChange={setPressBio}
            placeholder="Write a biography for press and media use. If left blank, your regular bio will be displayed."
          />
          <p className="text-xs text-gray-400">Falls back to your regular biography if left blank.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Press inquiry email
          </label>
          <input
            type="email"
            value={pressContact}
            onChange={(e) => setPressContact(e.target.value)}
            placeholder="press@yourdomain.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">Falls back to your general contact email if left blank.</p>
        </div>
      </section>

      {/* Read-only info cards */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Auto-populated Content</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          These sections appear on your public media kit automatically — no extra setup needed.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <ImageIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Author Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {initialData.profileImageUrl
                  ? "Your photo is set — visitors can download it."
                  : "No photo set. Upload one in Branding → Profile."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Books for Press</p>
              <p className="text-xs text-gray-400 mt-0.5">
                All published books appear with downloadable cover images.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
