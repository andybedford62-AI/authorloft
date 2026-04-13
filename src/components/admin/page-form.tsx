"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Navigation, Info, AlertCircle, Loader2, Save,
  Link as LinkIcon, Type, AlignLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Must be loaded client-side only — TipTap uses browser APIs incompatible with SSR
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center h-64 text-sm text-gray-400">
        Loading editor…
      </div>
    ),
  }
);

interface PageData {
  id?: string;
  title: string;
  slug: string;
  navTitle: string;
  content: string;
  isPublished: boolean;
  showInNav: boolean;
}

interface PageFormProps {
  initial?: Partial<PageData>;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PageForm({ initial }: PageFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [data, setData] = useState<PageData>({
    id: initial?.id,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    navTitle: initial?.navTitle ?? "",
    content: initial?.content ?? "",
    isPublished: initial?.isPublished ?? true,
    showInNav: initial?.showInNav ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PageData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugAutoSync, setSlugAutoSync] = useState(!isEdit);

  function set<K extends keyof PageData>(key: K, value: PageData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError(null);
  }

  function handleTitleChange(value: string) {
    set("title", value);
    if (slugAutoSync) {
      set("slug", slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    set("slug", value);
    setSlugAutoSync(false); // manual override from now on
  }

  function validate() {
    const e: Partial<Record<keyof PageData, string>> = {};
    if (!data.title.trim()) e.title = "Title is required";
    if (!data.slug.trim()) e.slug = "URL slug is required";
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      e.slug = "Only lowercase letters, numbers, and hyphens";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setServerError(null);

    try {
      const url = isEdit ? `/api/admin/pages/${data.id}` : "/api/admin/pages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          slug: data.slug.trim(),
          navTitle: data.navTitle.trim() || null,
          content: data.content,
          isPublished: data.isPublished,
          showInNav: data.showInNav,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/admin/pages");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* ── Page Settings ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Page Settings</h2>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Type className="h-4 w-4 text-gray-400" />
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Events, FAQ, My Story"
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.title ? "border-red-400 bg-red-50" : "border-gray-300"
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* URL Slug */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              Page URL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500 select-none">
                yoursite.com/
              </span>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => handleSlugChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="my-page"
                className={cn(
                  "flex-1 px-3 py-2 border rounded-r-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.slug ? "border-red-400 bg-red-50" : "border-gray-300"
                )}
              />
            </div>
            {errors.slug ? (
              <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Lowercase letters, numbers, and hyphens only.
                {!isEdit && " Auto-generated from title — you can customise it."}
              </p>
            )}
          </div>

          {/* Nav Title (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Navigation className="h-4 w-4 text-gray-400" />
              Navigation Label
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={data.navTitle}
              onChange={(e) => set("navTitle", e.target.value)}
              placeholder={data.title || "Shorter label for the menu"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              If set, this shorter label appears in the navigation menu instead of the full page title.
            </p>
          </div>
        </div>
      </div>

      {/* ── Visibility ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Visibility</h2>
        </div>
        <div className="px-5 py-5 space-y-4">

          {/* Published */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {data.isPublished ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">Published</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-6">
                {data.isPublished
                  ? "Page is live and accessible to readers at its URL."
                  : "Page is a draft — only you can see it when logged in."}
              </p>
            </div>
            <button
              onClick={() => set("isPublished", !data.isPublished)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                data.isPublished ? "bg-green-500" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                  data.isPublished ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Show in nav */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Navigation className={cn("h-4 w-4", data.showInNav ? "text-blue-500" : "text-gray-400")} />
                <span className="text-sm font-medium text-gray-700">Show in navigation</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-6">
                {data.showInNav
                  ? "Link will appear in the site navigation menu."
                  : "Page exists but won't show in the nav menu (accessible via direct link)."}
              </p>
            </div>
            <button
              onClick={() => set("showInNav", !data.showInNav)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                data.showInNav ? "bg-blue-600" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                  data.showInNav ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Info hint */}
          {!data.isPublished && data.showInNav && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                This page is unpublished. Even with &quot;Show in nav&quot; on, the link won&apos;t appear
                until the page is published.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlignLeft className="h-4 w-4 text-gray-400" />
            Page Content
          </h2>
        </div>
        <div className="px-5 py-5">
          <RichTextEditor
            value={data.content}
            onChange={(html) => set("content", html)}
            placeholder="Write your page content here…"
          />
        </div>
      </div>

      {/* ── Save button ─── */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEdit ? "Save Changes" : "Create Page"}
        </button>
      </div>
    </div>
  );
}
