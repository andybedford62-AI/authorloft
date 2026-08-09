"use client";

import { useState, useRef } from "react";
import { useRouter }         from "next/navigation";
import { ImageIcon, Upload, X, Loader2, Check, Send, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Token    = { platform: string; accountName: string; isActive: boolean };
type PostData = {
  id:          string;
  caption:     string;
  mediaUrl:    string | null;
  platforms:   string[];
  status:      string;
  scheduledAt: string | null;
};

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN:  "LinkedIn",
  FACEBOOK:  "Facebook",
  INSTAGRAM: "Instagram",
  TWITTER:   "X (Twitter)",
};

const CAPTION_LIMITS: Record<string, number> = {
  LINKEDIN:  3000,
  FACEBOOK:  63206,
  INSTAGRAM: 2200,
  TWITTER:   280,
};

interface Props {
  tokens: Token[];
  post?:  PostData;
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

export function SocialPostForm({ tokens, post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const connectedPlatforms = tokens.filter((t) => t.isActive).map((t) => t.platform);

  const [caption,     setCaption]     = useState(post?.caption     ?? "");
  const [platforms,   setPlatforms]   = useState<string[]>(post?.platforms  ?? connectedPlatforms);
  const [mediaUrl,    setMediaUrl]    = useState(post?.mediaUrl    ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );

  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Effective caption limit = lowest limit across selected platforms
  const captionLimit = platforms.length > 0
    ? Math.min(...platforms.map((p) => CAPTION_LIMITS[p] ?? 3000))
    : 3000;

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/super-admin/social/posts/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMediaUrl(data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(publishNow = false) {
    if (!caption.trim()) { setError("Caption is required."); return; }
    if (platforms.length === 0) { setError("Select at least one platform."); return; }
    if (platforms.includes("INSTAGRAM") && !mediaUrl) {
      setError("Instagram requires an image — please upload one.");
      return;
    }

    publishNow ? setPublishing(true) : setSaving(true);
    setError("");

    const payload = {
      caption:    caption.trim(),
      mediaUrl:   mediaUrl   || null,
      mediaType:  mediaUrl   ? "IMAGE" : null,
      platforms,
      scheduledAt: !publishNow && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };

    try {
      let postId = post?.id;

      // Create or update the post
      if (isEdit) {
        const res = await fetch(`/api/super-admin/social/posts/${post.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Save failed"); }
      } else {
        const res = await fetch("/api/super-admin/social/posts", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        postId = data.id;
      }

      if (publishNow && postId) {
        const res = await fetch(`/api/super-admin/social/posts/${postId}/publish`, { method: "POST" });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Publish failed"); }
      }

      router.push("/super-admin/social");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => router.push("/super-admin/social")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Social
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Platforms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Platforms</h2>
        {connectedPlatforms.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            No platforms connected yet. Go to Social → Connect a platform first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {connectedPlatforms.map((p) => {
              const selected = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selected
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {PLATFORM_LABELS[p] ?? p}
                </button>
              );
            })}
          </div>
        )}
        {platforms.includes("INSTAGRAM") && !mediaUrl && (
          <p className="text-xs text-amber-600">⚠ Instagram requires an image to post.</p>
        )}
      </div>

      {/* Caption */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Caption</h2>
          <span className={`text-xs tabular-nums ${caption.length > captionLimit ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {caption.length} / {captionLimit.toLocaleString()}
          </span>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          placeholder="Write your post caption here…"
          className={inputCls + " resize-y"}
        />
        {platforms.length > 0 && (
          <p className="text-xs text-gray-400">
            Character limit shown is for the most restrictive selected platform ({
              platforms.reduce((min, p) => (CAPTION_LIMITS[p] ?? 3000) < (CAPTION_LIMITS[min] ?? 3000) ? p : min, platforms[0])
            }: {captionLimit.toLocaleString()} chars).
          </p>
        )}
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">Image <span className="text-gray-400 font-normal">(optional — required for Instagram)</span></h2>
          <p className="text-xs text-gray-400">Optimal: 1200 × 630px (16:9) · JPG, PNG or WebP</p>
        </div>

        {mediaUrl ? (
          <div className="relative w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt="Post image preview" className="rounded-lg border border-gray-200 w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => setMediaUrl("")}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow border border-gray-200 text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50 w-full justify-center"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Click to upload image"}
            </button>
          </>
        )}
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Schedule</h2>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600">
            Post date &amp; time <span className="text-gray-400">(leave blank to save as draft)</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className={inputCls}
          />
        </div>
        {scheduledAt && (
          <p className="text-xs text-gray-400">
            Will be published automatically by the background job within 5 minutes of the scheduled time.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap pb-6">
        <button
          onClick={() => handleSave(true)}
          disabled={publishing || saving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish Now
        </button>
        <Button
          onClick={() => handleSave(false)}
          disabled={publishing || saving}
        >
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : scheduledAt ? <><Calendar className="h-4 w-4 mr-2" />Schedule</> : <><Check className="h-4 w-4 mr-2" />Save Draft</>}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/super-admin/social")} disabled={publishing || saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
