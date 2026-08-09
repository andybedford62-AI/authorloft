"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ArrowLeft, Check, Loader2, Trash2, Upload, Link2, X, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Guide = {
  id:              string;
  title:           string;
  slug:            string;
  excerpt:         string;
  content:         string;
  coverImageUrl:   string | null;
  category:        string;
  seoTitle:        string | null;
  metaDescription: string | null;
  focusKeyword:    string | null;
  faqsJson:        string | null;
  relatedSlugsJson: string | null;
  ctaTitle:        string | null;
  ctaDescription:  string | null;
  ctaButtonText:   string | null;
  ctaButtonUrl:    string | null;
  sortOrder:       number;
  isPublished:     boolean;
};

interface Props {
  guide?: Guide;
  categoryOptions?: string[];
}

type FaqItem = { question: string; answer: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

function parseFaqs(json: string | null): FaqItem[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

function parseSlugs(json: string | null): string[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export function GuideForm({ guide, categoryOptions = [] }: Props) {
  const router = useRouter();
  const isEdit = !!guide;

  const [title,           setTitle]           = useState(guide?.title           ?? "");
  const [slug,            setSlug]            = useState(guide?.slug            ?? "");
  const [excerpt,         setExcerpt]         = useState(guide?.excerpt         ?? "");
  const [content,         setContent]         = useState(guide?.content         ?? "");
  const [coverImageUrl,   setCoverImageUrl]   = useState(guide?.coverImageUrl   ?? "");
  const [category,        setCategory]        = useState(guide?.category        ?? "");
  const [seoTitle,        setSeoTitle]        = useState(guide?.seoTitle        ?? "");
  const [metaDescription, setMetaDescription] = useState(guide?.metaDescription ?? "");
  const [focusKeyword,    setFocusKeyword]    = useState(guide?.focusKeyword    ?? "");
  const [faqs,            setFaqs]            = useState<FaqItem[]>(parseFaqs(guide?.faqsJson ?? null));
  const [relatedSlugs,    setRelatedSlugs]    = useState<string[]>(parseSlugs(guide?.relatedSlugsJson ?? null));
  const [ctaTitle,        setCtaTitle]        = useState(guide?.ctaTitle        ?? "");
  const [ctaDescription,  setCtaDescription]  = useState(guide?.ctaDescription  ?? "");
  const [ctaButtonText,   setCtaButtonText]   = useState(guide?.ctaButtonText   ?? "Get Started Free");
  const [ctaButtonUrl,    setCtaButtonUrl]    = useState(guide?.ctaButtonUrl    ?? "/register");
  const [sortOrder,       setSortOrder]       = useState(guide?.sortOrder       ?? 0);
  const [isPublished,     setIsPublished]     = useState(guide?.isPublished     ?? false);

  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageTab,    setImageTab]    = useState<"upload" | "url">("upload");
  const [urlInput,    setUrlInput]    = useState(guide?.coverImageUrl ?? "");

  const slugTouched = useRef(isEdit);
  const fileRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugTouched.current) setSlug(slugify(title));
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

    const url    = isEdit ? `/api/super-admin/guides/${guide.id}` : "/api/super-admin/guides";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, excerpt, content,
        coverImageUrl: coverImageUrl || null,
        category,
        seoTitle:        seoTitle || null,
        metaDescription: metaDescription || null,
        focusKeyword:    focusKeyword || null,
        faqsJson:        faqs.length > 0 ? JSON.stringify(faqs) : null,
        relatedSlugsJson: relatedSlugs.filter(Boolean).length > 0 ? JSON.stringify(relatedSlugs.filter(Boolean)) : null,
        ctaTitle:        ctaTitle || null,
        ctaDescription:  ctaDescription || null,
        ctaButtonText:   ctaButtonText || null,
        ctaButtonUrl:    ctaButtonUrl || null,
        sortOrder,
        isPublished,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/super-admin/guides");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this guide permanently?")) return;
    setDeleting(true);
    await fetch(`/api/super-admin/guides/${guide!.id}`, { method: "DELETE" });
    router.push("/super-admin/guides");
    router.refresh();
  }

  function addFaq() { setFaqs([...faqs, { question: "", answer: "" }]); }
  function updateFaq(i: number, field: "question" | "answer", value: string) {
    const next = [...faqs];
    next[i] = { ...next[i], [field]: value };
    setFaqs(next);
  }
  function removeFaq(i: number) { setFaqs(faqs.filter((_, idx) => idx !== i)); }

  function addRelatedSlug() { setRelatedSlugs([...relatedSlugs, ""]); }
  function updateRelatedSlug(i: number, value: string) {
    const next = [...relatedSlugs];
    next[i] = value;
    setRelatedSlugs(next);
  }
  function removeRelatedSlug(i: number) { setRelatedSlugs(relatedSlugs.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-8">
      {/* Back */}
      <button onClick={() => router.push("/super-admin/guides")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Guides
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Title + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What Is an Author Website?" />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} value={slug} onChange={(e) => { slugTouched.current = true; setSlug(e.target.value); }} placeholder="what-is-an-author-website" />
        </div>
      </div>

      {/* Category + Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          {categoryOptions.length > 0 ? (
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Uncategorized</option>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Author Basics" />
          )}
        </div>
        <div>
          <label className={labelCls}>Sort Order</label>
          <input type="number" className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelCls}>Excerpt / Summary</label>
        <textarea className={inputCls} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="A short summary that appears in listings and meta descriptions..." />
      </div>

      {/* Cover image */}
      <div>
        <label className={labelCls}>Cover Image</label>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setImageTab("upload")} className={`text-xs px-3 py-1 rounded-full border ${imageTab === "upload" ? "bg-purple-50 border-purple-300 text-purple-700" : "border-gray-200 text-gray-500"}`}>
            <Upload className="h-3 w-3 inline mr-1" />Upload
          </button>
          <button onClick={() => setImageTab("url")} className={`text-xs px-3 py-1 rounded-full border ${imageTab === "url" ? "bg-purple-50 border-purple-300 text-purple-700" : "border-gray-200 text-gray-500"}`}>
            <Link2 className="h-3 w-3 inline mr-1" />URL
          </button>
        </div>
        {imageTab === "upload" ? (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 text-sm border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Choose image"}
            </button>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>
        ) : (
          <div className="flex gap-2">
            <input className={inputCls} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." />
            <Button variant="outline" size="sm" onClick={() => setCoverImageUrl(urlInput)}>Set</Button>
          </div>
        )}
        {coverImageUrl && (
          <div className="mt-2 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover" className="h-24 rounded-lg border border-gray-200 object-cover" />
            <button onClick={() => { setCoverImageUrl(""); setUrlInput(""); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content (rich text) */}
      <div>
        <label className={labelCls}>Content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* FAQs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>FAQs (appears at bottom of guide + generates FAQ schema)</label>
          <button onClick={addFaq} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
            <Plus className="h-3 w-3" /> Add FAQ
          </button>
        </div>
        {faqs.length === 0 && <p className="text-xs text-gray-400">No FAQs yet. Click &ldquo;Add FAQ&rdquo; to add one.</p>}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex items-start gap-2">
                <input className={inputCls} value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question..." />
                <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 mt-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea className={inputCls} rows={2} value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer..." />
            </div>
          ))}
        </div>
      </div>

      {/* Related Blog Posts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Related Blog Post Slugs (links shown on the guide page)</label>
          <button onClick={addRelatedSlug} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
            <Plus className="h-3 w-3" /> Add Slug
          </button>
        </div>
        {relatedSlugs.length === 0 && <p className="text-xs text-gray-400">No related posts yet. Add blog post slugs to link them.</p>}
        <div className="space-y-2">
          {relatedSlugs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">/blog/</span>
              <input className={inputCls} value={s} onChange={(e) => updateRelatedSlug(i, e.target.value)} placeholder="e.g. author-website-mistakes" />
              <button onClick={() => removeRelatedSlug(i)} className="text-red-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Block */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
        <label className={labelCls}>CTA Block (shown at bottom of guide)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">CTA Title</label>
            <input className={inputCls} value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} placeholder="Ready to own your author business?" />
          </div>
          <div>
            <label className="text-xs text-gray-500">CTA Description</label>
            <input className={inputCls} value={ctaDescription} onChange={(e) => setCtaDescription(e.target.value)} placeholder="Start building your site today." />
          </div>
          <div>
            <label className="text-xs text-gray-500">Button Text</label>
            <input className={inputCls} value={ctaButtonText} onChange={(e) => setCtaButtonText(e.target.value)} placeholder="Get Started Free" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Button URL</label>
            <input className={inputCls} value={ctaButtonUrl} onChange={(e) => setCtaButtonUrl(e.target.value)} placeholder="/register" />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
        <label className={labelCls}>SEO Settings</label>
        <div>
          <label className="text-xs text-gray-500">Focus Keyword</label>
          <input className={inputCls} value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. author website" />
        </div>
        <div>
          <label className="text-xs text-gray-500">SEO Title (overrides page title in search results)</label>
          <input className={inputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="What Is an Author Website? | AuthorLoft" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Meta Description</label>
          <textarea className={inputCls} rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A comprehensive guide to..." />
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isPublished ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-gray-700">{isPublished ? "Published" : "Draft"}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
          {isEdit ? "Save Changes" : "Create Guide"}
        </Button>
        {isEdit && (
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
