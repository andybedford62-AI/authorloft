"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-80 border border-gray-200 rounded-lg bg-gray-50 animate-pulse" /> }
);

interface PostFormProps {
  /** Pass a post to pre-populate the form for editing. Omit for new post. */
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    coverImageUrl: string | null;
    isPublished: boolean;
  };
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const textareaClass = inputClass + " resize-none";

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title,         setTitle]         = useState(post?.title         ?? "");
  const [slug,          setSlug]          = useState(post?.slug          ?? "");
  const [excerpt,       setExcerpt]       = useState(post?.excerpt       ?? "");
  const [content,       setContent]       = useState(post?.content       ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [isPublished,   setIsPublished]   = useState(post?.isPublished   ?? false);

  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadErr, setCoverUploadErr] = useState("");
  const coverFileRef = useRef<HTMLInputElement>(null);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setCoverUploadErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setCoverImageUrl(data.url);
    } catch (err) {
      setCoverUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCoverUploading(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  }

  // Auto-generate slug from title when creating a new post
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEdit) setSlug(toSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { title, slug, excerpt, content, coverImageUrl, isPublished };
    const url    = isEdit ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save post. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Core details ───────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Post Details</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
            required
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="post-url-slug"
              className={inputClass}
            />
          </div>
          <p className="text-xs text-gray-400">Auto-generated from title. Lowercase letters, numbers, and hyphens only.</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short teaser shown on the blog listing page"
            className={textareaClass}
          />
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Content</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Post Body</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post here…"
          />
          <p className="text-xs text-gray-400">Use the toolbar to add headings, bold/italic, lists, links, and more.</p>
        </div>
      </section>

      {/* ── Cover Image ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">Cover Image</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Shown as the banner at the top of the post and as the thumbnail on the blog listing page.
            Any size works — the image auto-crops to fit. Landscape photos look best;
            ideal size is <strong className="text-gray-500">1200 × 630 px</strong> (2:1 ratio).
          </p>
        </div>

        {/* Preview + remove */}
        {coverImageUrl ? (
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover preview" className="w-full h-52 object-cover" />
            <button
              type="button"
              onClick={() => { setCoverImageUrl(""); setCoverUploadErr(""); }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              title="Remove cover image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Upload drop zone */
          <div>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverFileRef.current?.click()}
              disabled={coverUploading}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
            >
              {coverUploading ? (
                <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm">Uploading…</span></>
              ) : (
                <><Upload className="h-6 w-6" /><span className="text-sm font-medium">Click to upload an image</span><span className="text-xs">JPEG, PNG, WebP or GIF · max 8 MB</span></>
              )}
            </button>
          </div>
        )}

        {/* URL fallback */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Or paste an image URL
          </label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => { setCoverImageUrl(e.target.value); setCoverUploadErr(""); }}
            placeholder="https://example.com/photo.jpg"
            className={inputClass}
          />
        </div>

        {coverUploadErr && (
          <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{coverUploadErr}</p>
        )}
      </section>

      {/* ── Publishing ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Publishing</h2>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${isPublished ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isPublished ? "Published — visible to readers" : "Draft — not visible to readers"}
          </span>
        </label>
      </section>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />{isEdit ? "Save Changes" : "Create Post"}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
