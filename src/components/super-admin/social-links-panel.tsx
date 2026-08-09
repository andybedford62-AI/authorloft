"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";
import type { SocialLink } from "@/app/api/super-admin/settings/social-links/route";

const ICON_OPTIONS = [
  "linkedin",
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "github",
  "mail",
  "globe",
];

export function SocialLinksPanel() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLink>>({});

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/settings/social-links");
      if (!res.ok) throw new Error("Failed to fetch social links");
      const data = await res.json();
      setLinks((data.socialLinks as SocialLink[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function saveLinks(newLinks: SocialLink[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/settings/social-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socialLinks: newLinks }),
      });
      // Parse body defensively — an empty/non-JSON response (e.g. a 500)
      // must not surface as "Unexpected end of JSON input".
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Failed to save social links (${res.status})`);
      }
      setLinks((data?.socialLinks as SocialLink[]) || []);
      setEditingId(null);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  function startAdd() {
    const newId = `temp_${Date.now()}`;
    setFormData({
      id: newId,
      platform: "",
      url: "",
      icon: "globe",
      sortOrder: links.length,
    });
    setEditingId(newId);
  }

  function startEdit(link: SocialLink) {
    setFormData({ ...link });
    setEditingId(link.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
  }

  async function saveEdit() {
    const { id, platform, url, icon, sortOrder } = formData;
    if (!platform?.trim() || !url?.trim()) {
      setError("Platform and URL are required");
      return;
    }

    let newLinks: SocialLink[];
    if (editingId?.startsWith("temp_")) {
      // Adding new
      newLinks = [
        ...links,
        {
          id: `social_${Date.now()}`,
          platform: platform.trim(),
          url: url.trim(),
          icon: icon || "globe",
          sortOrder: links.length,
        },
      ];
    } else {
      // Editing existing
      newLinks = links.map((l) =>
        l.id === id
          ? {
              ...l,
              platform: platform.trim(),
              url: url.trim(),
              icon: icon || "globe",
              sortOrder: sortOrder ?? l.sortOrder,
            }
          : l
      );
    }
    await saveLinks(newLinks);
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this social link?")) return;
    const newLinks = links.filter((l) => l.id !== id);
    await saveLinks(newLinks);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Company Social Links</h3>
        {editingId === null && (
          <Button onClick={startAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Link
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {links.length === 0 && editingId === null && (
          <p className="text-sm text-gray-500 py-8 text-center">
            No social links yet. Add one to get started.
          </p>
        )}

        {/* Existing links */}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {editingId === link.id ? (
              // Edit mode
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={formData.platform || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, platform: e.target.value })
                      }
                      placeholder="e.g., LinkedIn, TikTok"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Icon (Lucide name)
                    </label>
                    <select
                      value={formData.icon || "globe"}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{link.platform}</p>
                <p className="text-xs text-gray-500 truncate">{link.url}</p>
              </div>
            )}

            <div className="flex items-center gap-2 flex-shrink-0">
              {editingId === link.id ? (
                <>
                  <IconButton
                    icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    title="Save"
                    variant="edit"
                    onClick={saveEdit}
                    disabled={saving}
                  />
                  <IconButton
                    icon={<X className="h-4 w-4" />}
                    title="Cancel"
                    variant="ghost"
                    onClick={cancelEdit}
                    disabled={saving}
                  />
                </>
              ) : (
                <>
                  <IconButton
                    icon={<Edit2 className="h-4 w-4" />}
                    title="Edit"
                    variant="edit"
                    onClick={() => startEdit(link)}
                  />
                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    title="Delete"
                    variant="delete"
                    onClick={() => deleteLink(link.id)}
                  />
                </>
              )}
            </div>
          </div>
        ))}

        {/* New link form */}
        {editingId?.startsWith("temp_") && (
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">New Social Link</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platform || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  placeholder="e.g., LinkedIn, TikTok"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Icon (Lucide name)
                </label>
                <select
                  value={formData.icon || "globe"}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={formData.url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>Cancel</Button>
              <Button size="sm" onClick={saveEdit} disabled={saving}>
                {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : <><Check className="h-3.5 w-3.5 mr-1.5" />Save Link</>}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
        💡 Tip: Add any social platform! Use the Lucide icon name (e.g., "linkedin", "tiktok",
        "youtube"). Links will appear on all marketing pages.
      </p>
    </div>
  );
}
