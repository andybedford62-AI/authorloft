"use client";

import { useState, useEffect } from "react";
import { Loader2, BookmarkPlus, FolderOpen, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/admin/icon-button";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export interface EmailTemplate {
  id:        string;
  name:      string;
  subject:   string;
  body:      string;
  category:  string;
  updatedAt: string;
}

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  welcome:        "Welcome",
  support:        "Offer Help",
  promotion:      "Promotion",
  "re-engagement": "Re-engagement",
  general:        "General",
};

interface EmailComposerProps {
  subject:          string;
  body:             string;
  onSubjectChange:  (v: string) => void;
  onBodyChange:     (v: string) => void;
  bodyPlaceholder?: string;
  disabled?:        boolean;
}

// Shared compose surface (subject/body + template save/load/update) used by
// both the mass-broadcast panel and the per-author "send email" modal.
export function EmailComposer({ subject, body, onSubjectChange, onBodyChange, bodyPlaceholder, disabled }: EmailComposerProps) {
  const [templates,       setTemplates]       = useState<EmailTemplate[]>([]);
  const [showTemplates,   setShowTemplates]   = useState(false);
  const [showSaveModal,   setShowSaveModal]   = useState(false);
  const [templateName,    setTemplateName]    = useState("");
  const [savingTemplate,  setSavingTemplate]  = useState(false);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);
  const [updating,        setUpdating]        = useState(false);

  function loadTemplates() {
    fetch("/api/super-admin/broadcast-templates")
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => {});
  }

  useEffect(() => { loadTemplates(); }, []);

  function loadTemplate(t: EmailTemplate) {
    onSubjectChange(t.subject);
    onBodyChange(t.body);
    setLoadedTemplateId(t.id);
    setShowTemplates(false);
  }

  async function handleSaveAsNew() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/super-admin/broadcast-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), subject, body }),
      });
      const created = await res.json();
      loadTemplates();
      setShowSaveModal(false);
      setTemplateName("");
      if (created?.id) setLoadedTemplateId(created.id);
    } catch {}
    finally { setSavingTemplate(false); }
  }

  async function handleUpdateLoaded() {
    if (!loadedTemplateId) return;
    const existing = templates.find(t => t.id === loadedTemplateId);
    if (!existing) return;
    setUpdating(true);
    try {
      await fetch(`/api/super-admin/broadcast-templates/${loadedTemplateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: existing.name, subject, body, category: existing.category }),
      });
      loadTemplates();
    } catch {}
    finally { setUpdating(false); }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/super-admin/broadcast-templates/${id}`, { method: "DELETE" });
    if (loadedTemplateId === id) setLoadedTemplateId(null);
    loadTemplates();
  }

  const loadedTemplate = templates.find(t => t.id === loadedTemplateId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Use <code className="bg-gray-100 px-1 rounded text-xs">{"{{firstName}}"}</code> to personalise.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Load template {templates.length > 0 && `(${templates.length})`}
          </button>
          {loadedTemplate && (
            <button
              onClick={handleUpdateLoaded}
              disabled={updating}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 disabled:opacity-40 transition-colors"
            >
              {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
              Update &ldquo;{loadedTemplate.name}&rdquo;
            </button>
          )}
          <button
            onClick={() => { setTemplateName(""); setShowSaveModal(true); }}
            disabled={!subject.trim() && !body.trim()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 disabled:opacity-40 transition-colors"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save as new template
          </button>
        </div>
      </div>

      {/* Template list */}
      {showTemplates && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">No saved templates yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {templates.map(t => (
                <li key={t.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                  <button onClick={() => loadTemplate(t)} className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {t.name}
                      <span className="text-[10px] uppercase tracking-wide bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {TEMPLATE_CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">{t.subject}</p>
                  </button>
                  <IconButton icon={<Trash2 className="h-4 w-4" />} title="Delete template" variant="delete" onClick={() => deleteTemplate(t.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Save-as-new modal */}
      {showSaveModal && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-purple-900">Save as new template</p>
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Template name (e.g. Monthly Update)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSaveAsNew} disabled={savingTemplate || !templateName.trim()}>
              {savingTemplate ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : <><Check className="h-3.5 w-3.5 mr-1.5" />Save</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => onSubjectChange(e.target.value)}
          placeholder="Email subject…"
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Body</label>
        <RichTextEditor
          value={body}
          onChange={onBodyChange}
          placeholder={bodyPlaceholder ?? "Hi {{firstName}}, your message here…"}
          minHeight="220px"
          editable={!disabled}
        />
      </div>
    </div>
  );
}
