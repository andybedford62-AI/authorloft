"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ArrowLeft, Save, Loader2, Trash2, Upload, Link2, X, ImageIcon, FileDown } from "lucide-react";

type Post = {
  id:              string;
  title:           string;
  slug:            string;
  excerpt:         string;
  content:         string;
  coverImageUrl:   string | null;
  category:        string;
  authorName:      string;
  readTimeMinutes: number;
  isNews:          boolean;
  isPublished:     boolean;
  attachmentUrl:   string | null;
  attachmentLabel: string | null;
  focusKeyword:    string | null;
  seoTitle:        string | null;
  metaDescription: string | null;
};

interface Props {
  post?: Post;
  /** Active Content Categories (A–Z) for Blog posts. */
  blogCategories?: string[];
  /** Active Content Categories (A–Z) for News posts. */
  newsCategories?: string[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputCls  = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
const labelCls  = "block text-xs font-semibold text-gray-600 mb-1.5";

export function PlatformPostForm({ post, blogCategories = [], newsCategories = [] }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [title,           setTitle]           = useState(post?.title           ?? "");
  const [slug,            setSlug]            = useState(post?.slug            ?? "");
  const [excerpt,         setExcerpt]         = useState(post?.excerpt         ?? "");
  const [content,         setContent]         = useState(post?.content         ?? "");
  const [coverImageUrl,   setCoverImageUrl]   = useState(post?.coverImageUrl   ?? "");
  const [category,        setCategory]        = useState(post?.category        ?? "");
  const [isNews,          setIsNews]          = useState(post?.isNews          ?? false);
  const [authorName,      setAuthorName]      = useState(post?.authorName      ?? "AuthorLoft Team");
  const [readTimeMinutes, setReadTimeMinutes] = useState(post?.readTimeMinutes ?? 5);
  const [isPublished,     setIsPublished]     = useState(post?.isPublished     ?? false);
  const [attachmentUrl,   setAttachmentUrl]   = useState(post?.attachmentUrl   ?? "");
  const [attachmentLabel, setAttachmentLabel] = useState(post?.attachmentLabel ?? "");
  const [focusKeyword,    setFocusKeyword]    = useState(post?.focusKeyword    ?? "");
  const [seoTitle,        setSeoTitle]        = useState(post?.seoTitle        ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");

  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageTab,    setImageTab]    = useState<"upload" | "url">("upload");
  const [urlInput,    setUrlInput]    = useState(post?.coverImageUrl ?? "");

  const slugTouched = useRef(isEdit);
  const fileRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugTouched.current) {
      setSlug(slugify(title));
    }
  }, [title]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/super-admin/blog/posts/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setCoverImageUrl(data.url);
      setUrlInput(data.url);
    } catch (e: any) {
      setUploadError(e.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim())  { setError("Slug is required."); return; }

    setSaving(true);
    setError(null);

    const url    = isEdit ? `/api/super-admin/blog/posts/${post.id}` : "/api/super-admin/blog/posts";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, excerpt, content, coverImageUrl: coverImageUrl || null, category, isNews, authorName, readTimeMinutes, isPublished, attachmentUrl: attachmentUrl || null, attachmentLabel: attachmentLabel || null, focusKeyword: focusKeyword || null, seoTitle: seoTitle || null, metaDescription: metaDescription || null }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) { setError(json.error ?? "Save failed."); return; }
    router.push("/super-admin/blog");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${post?.title}" permanently? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/super-admin/blog/posts/${post!.id}`, { method: "DELETE" });
    router.push("/super-admin/blog");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/super-admin/blog")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </button>

      {/* ── Top save bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Post"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Title + Slug */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Post Details</h2>

        {/* Post type: Blog Article vs News */}
        <div className="space-y-1.5">
          <label className={labelCls}>Post Type</label>
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsNews(false);
                if (category && !blogCategories.includes(category)) setCategory("");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                !isNews ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Blog Article
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNews(true);
                if (category && !newsCategories.includes(category)) setCategory("");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isNews ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              News
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {isNews
              ? "Shows on the public AuthorLoft News page (/news) — for announcements, updates, specials, events."
              : "Shows on the public Blog (/blog) — for evergreen tips, guides, and articles."}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to Sell Books Directly to Readers"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>
            URL Slug <span className="text-red-500">*</span>
            <span className="ml-2 text-gray-400 font-normal normal-case">{isNews ? "/news/" : "/blog/"}{slug || "your-slug-here"}</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { slugTouched.current = true; setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
            placeholder="how-to-sell-books-directly"
            className={inputCls + " font-mono"}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>Category</label>
            {(() => {
              const options = isNews ? newsCategories : blogCategories;
              const withCurrent = category && !options.includes(category) ? [...options, category] : options;
              return (
                <>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select a category…</option>
                    {withCurrent.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {options.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No {isNews ? "News" : "Blog"} categories exist yet. Add some under Content Categories first.
                    </p>
                  )}
                </>
              );
            })()}
            <p className="text-xs text-gray-400">Used for filtering on the public page.</p>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Author Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="AuthorLoft Team"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Read Time (minutes)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={readTimeMinutes}
              onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Excerpt</h2>
          <p className="text-xs text-gray-400 mt-0.5">Short summary shown on the blog index and in search results. 1–2 sentences.</p>
        </div>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A brief description of what this post covers…"
          rows={3}
          className={inputCls + " resize-y"}
        />
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">Cover Image</h2>
          <div className="text-xs text-gray-400 text-right leading-relaxed">
            <span className="font-medium text-gray-500">Optimal:</span> 1200 × 630px (16:9)
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="font-medium text-gray-500">Min:</span> 768 × 400px
            <span className="mx-1.5 text-gray-300">·</span>
            JPG, PNG or WebP
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {(["upload", "url"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setImageTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                imageTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "upload" ? <><Upload className="h-3 w-3 inline mr-1" />Upload</> : <><Link2 className="h-3 w-3 inline mr-1" />URL</>}
            </button>
          ))}
        </div>

        {imageTab === "upload" ? (
          <div>
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
            {uploadError && <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setCoverImageUrl(e.target.value); }}
              placeholder="https://example.com/cover-image.jpg"
              className={inputCls}
            />
          </div>
        )}

        {coverImageUrl && (
          <div className="relative w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover preview" className="rounded-lg border border-gray-200 w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => { setCoverImageUrl(""); setUrlInput(""); }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow border border-gray-200 text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Content</h2>
          <p className="text-xs text-gray-400 mt-0.5">Full post body. Use headings, lists, bold, links, and images.</p>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your post content here…"
          minHeight="400px"
          resizable
          showSeoGuide
        />
      </div>

      {/* Publish */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Visibility</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 peer-checked:bg-purple-600 rounded-full transition-colors" />
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{isPublished ? "Published" : "Draft"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isPublished
                ? `This post is live at authorloft.com${isNews ? "/news" : "/blog"}`
                : "Save as draft — not visible to the public yet"}
            </p>
          </div>
        </label>
      </div>

      {/* ── Downloadable Resource ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileDown className="h-4 w-4 text-gray-400" />
            Downloadable Resource
            <span className="text-xs font-normal text-gray-400">— optional</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Attach a link to a downloadable file — a PDF, Google Doc, worksheet, checklist, etc.
            A download button will appear at the bottom of this post for readers. Leave blank if not needed.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Document URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://docs.google.com/… or https://example.com/file.pdf"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400">Google Docs, Google Drive, Dropbox, or a direct PDF link — any public URL.</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>
            Button Label
            <span className="ml-1.5 font-normal text-gray-400">— shown to readers</span>
          </label>
          <input
            type="text"
            value={attachmentLabel}
            onChange={(e) => setAttachmentLabel(e.target.value)}
            placeholder="e.g. Download Free Guide  |  Get the Worksheet  |  View on Google Docs"
            className={inputCls}
            maxLength={80}
          />
          <p className="text-xs text-gray-400">Defaults to &ldquo;Download Resource&rdquo; if left blank.</p>
        </div>

        {/* Live preview */}
        {attachmentUrl && (
          <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50 px-4 py-3 flex items-center gap-3">
            <FileDown className="h-5 w-5 text-purple-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-800">
                {attachmentLabel || "Download Resource"}
              </p>
              <p className="text-xs text-purple-400 truncate">{attachmentUrl}</p>
            </div>
            <span className="text-xs text-purple-400 flex-shrink-0">Preview</span>
          </div>
        )}
      </div>

      {/* ── SEO Settings ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">SEO Settings</h2>
          <p className="text-xs text-gray-400 mt-1">
            Optional. Leave blank to use the post title and excerpt automatically.
          </p>
        </div>

        {/* Focus Keyword */}
        <div className="space-y-2">
          <label className={labelCls}>Focus Keyword</label>
          <input
            type="text"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="e.g. author website builder"
            className={inputCls}
          />
          <p className="text-xs text-gray-400">The main keyword or phrase this post targets.</p>
          {/* Keyword placement tips */}
          <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-purple-800">💡 Where to use your focus keyword:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {[
                { tip: "Post title",              detail: "ideally in the first 5 words" },
                { tip: "First 100 words of body", detail: "signals relevance early" },
                { tip: "At least one H2 heading", detail: "Google reads headings heavily" },
                { tip: "URL slug",                detail: "auto-generated from title" },
                { tip: "SEO Title & Meta Desc",   detail: "fills the search snippet" },
                { tip: "2–3× in the body",        detail: "naturally — never forced" },
              ].map(({ tip, detail }) => (
                <li key={tip} className="flex items-start gap-1.5 text-xs text-purple-700">
                  <span className="mt-0.5 flex-shrink-0 text-purple-400">✓</span>
                  <span><span className="font-medium">{tip}</span> — {detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>SEO Title</label>
            <span className={`text-xs tabular-nums ${seoTitle.length > 60 ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {seoTitle.length}/60
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={title || "Overrides the post title in Google search results"}
            className={inputCls}
          />
          <p className="text-xs text-gray-400">Ideal: 50–60 characters. Shown in Google instead of the post title.</p>
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Meta Description</label>
            <span className={`text-xs tabular-nums ${metaDescription.length > 160 ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder={excerpt || "Overrides the excerpt in Google search result snippets"}
            className={inputCls + " resize-none"}
          />
          <p className="text-xs text-gray-400">Ideal: 150–160 characters. The snippet shown under your title in Google.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <div>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Post
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Post"}
        </button>
      </div>
    </div>
  );
}
