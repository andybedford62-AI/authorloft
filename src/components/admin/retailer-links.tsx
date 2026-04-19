"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ExternalLink, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";
import { RETAILERS, RETAILER_KEYS, getRetailer, type RetailerKey } from "@/lib/retailers";

// ── Types ─────────────────────────────────────────────────────────────────────

type RetailerLink = {
  id: string;
  retailer: string;
  label: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  bookId: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RetailerLinks({ bookId }: Props) {
  const [links, setLinks] = useState<RetailerLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add-form state
  const [adding, setAdding] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerKey>("amazon");
  const [customLabel, setCustomLabel] = useState("");
  const [url, setUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [saving, setSaving] = useState(false);

  // Per-link pending state (for activate/deactivate/delete)
  const [pending, setPending] = useState<Record<string, boolean>>({});

  // ── Load links ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/admin/books/${bookId}/retailers`)
      .then((r) => r.json())
      .then((data) => {
        setLinks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load retailer links.");
        setLoading(false);
      });
  }, [bookId]);

  // ── Add link ───────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!url.trim()) { setAddError("URL is required."); return; }

    setSaving(true);
    const res = await fetch(`/api/admin/books/${bookId}/retailers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retailer: selectedRetailer,
        url: url.trim(),
        label: customLabel.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAddError(data.error || "Could not add link.");
    } else {
      const created = await res.json();
      setLinks((prev) => [...prev, created]);
      setUrl("");
      setCustomLabel("");
      setAdding(false);
    }
    setSaving(false);
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  async function toggleActive(link: RetailerLink) {
    setPending((p) => ({ ...p, [link.id]: true }));
    const res = await fetch(`/api/admin/books/${bookId}/retailers/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    }
    setPending((p) => ({ ...p, [link.id]: false }));
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deleteLink(id: string, label: string) {
    if (!confirm(`Remove "${label}"? This cannot be undone.`)) return;
    setPending((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/admin/books/${bookId}/retailers/${id}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 204) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
    }
    setPending((p) => ({ ...p, [id]: false }));
  }

  // ── Auto-fill label when retailer changes ──────────────────────────────────
  function handleRetailerChange(key: RetailerKey) {
    setSelectedRetailer(key);
    if (key !== "custom") setCustomLabel("");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Buy Links</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Add links for each retailer where this book is available. Deactivated links are hidden from your public site.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Link
          </button>
        )}
      </div>

      {/* ── Add form ────────────────────────────────────────────────────────── */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-[var(--accent)]/30 bg-[color:var(--accent)]/3 p-4 space-y-3"
        >
          <p className="text-sm font-medium text-gray-700">Add a retailer link</p>

          {/* Retailer picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RETAILER_KEYS.map((key) => {
              const info = RETAILERS[key];
              const active = selectedRetailer === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRetailerChange(key)}
                  style={active ? { borderColor: info.color, backgroundColor: info.badgeBg, color: info.color } : {}}
                  className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors text-left
                    ${active
                      ? "shadow-sm"
                      : "border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {info.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Custom label (for "custom" retailer or override) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Button label
                {selectedRetailer !== "custom" && (
                  <span className="text-gray-400 font-normal"> (optional — overrides default)</span>
                )}
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={getRetailer(selectedRetailer).label}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {addError && <p className="text-xs text-red-600">{addError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {saving ? "Adding…" : "Add Link"}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setAddError(""); setUrl(""); setCustomLabel(""); }}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Link list ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading links…
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : links.length === 0 && !adding ? (
        <p className="text-sm text-gray-400 py-2">
          No retailer links yet. Click <strong>Add Link</strong> to get started.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {links.map((link) => {
            const info = getRetailer(link.retailer);
            const isBusy = pending[link.id];

            return (
              <div key={link.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">

                {/* Retailer colour dot + label */}
                <div
                  className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: info.color }}
                  title={info.shortLabel}
                >
                  {info.shortLabel.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{link.label}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-[var(--accent)] truncate flex items-center gap-1"
                  >
                    {link.url.length > 55 ? link.url.slice(0, 55) + "…" : link.url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Status badge */}
                <span
                  className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    link.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {link.isActive ? "Active" : "Inactive"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <IconButton
                    icon={link.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    title={link.isActive ? "Deactivate (hides from public site)" : "Activate"}
                    variant="ghost"
                    onClick={() => toggleActive(link)}
                    loading={isBusy}
                    disabled={isBusy}
                  />
                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    title="Delete link"
                    variant="ghost"
                    onClick={() => deleteLink(link.id, link.label)}
                    loading={isBusy}
                    disabled={isBusy}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
