"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
// TipTap v3 — use named exports where available, default where not
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Link2Off, Undo, Redo, Highlighter, ChevronDown,
  Type, Heading1, Heading2, Heading3, Heading4,
  ImageIcon, Upload, Link2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// ── Toolbar helpers ───────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor losing focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center h-7 w-7 rounded text-sm transition-colors flex-shrink-0",
        "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed",
        active ? "bg-blue-100 text-blue-700" : "text-gray-700"
      )}
    >
      {children}
    </button>
  );
}

// ── Text style (heading/paragraph) dropdown ──────────────────────────────────

function TextStyleDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = [
    { label: "Paragraph",  icon: Type,     action: () => editor.chain().focus().setParagraph().run(),          active: editor.isActive("paragraph") },
    { label: "Heading 1",  icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
    { label: "Heading 2",  icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { label: "Heading 3",  icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { label: "Heading 4",  icon: Heading4, action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor.isActive("heading", { level: 4 }) },
  ];

  const current = options.find((o) => o.active) ?? options[0];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Text style"
        className="flex items-center gap-1 h-7 px-2 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium w-16 text-left truncate">{current.label}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            {options.map((opt) => {
              const OptionIcon = opt.icon;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    opt.action();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors",
                    opt.active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <OptionIcon className="h-4 w-4 flex-shrink-0" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Font family dropdown ──────────────────────────────────────────────────────

const FONTS = [
  { label: "Default",     value: ""                                        },
  { label: "Sans-serif",  value: "ui-sans-serif, system-ui, sans-serif"    },
  { label: "Serif",       value: "ui-serif, Georgia, serif"                },
  { label: "Monospace",   value: "ui-monospace, 'Courier New', monospace"  },
  { label: "Georgia",     value: "Georgia, serif"                          },
  { label: "Trebuchet",   value: "Trebuchet MS, sans-serif"                },
];

function FontFamilyDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  // detect current font
  const attrs = editor.getAttributes("textStyle");
  const current = FONTS.find((f) => f.value === (attrs.fontFamily ?? "")) ?? FONTS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Font family"
        className="flex items-center gap-1 h-7 px-2 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-medium w-16 text-left truncate">{current.label}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[170px]">
            {FONTS.map((font) => (
              <button
                key={font.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (font.value) {
                    editor.chain().focus().setFontFamily(font.value).run();
                  } else {
                    editor.chain().focus().unsetFontFamily().run();
                  }
                  setOpen(false);
                }}
                style={{ fontFamily: font.value || undefined }}
                className={cn(
                  "flex items-center w-full px-3 py-1.5 text-sm text-left transition-colors",
                  current.value === font.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {font.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Color pickers ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#111827", "#374151", "#6b7280", "#9ca3af",
  "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#0284c7", "#4f46e5", "#7c3aed", "#db2777",
  "#fca5a5", "#fcd34d", "#86efac", "#93c5fd",
];

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentColor = editor.getAttributes("textStyle").color ?? "#111827";

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Text color"
        className="flex flex-col items-center justify-center h-7 w-7 rounded hover:bg-gray-100 transition-colors group"
      >
        <span className="text-xs font-bold text-gray-700 leading-none">A</span>
        <div
          className="w-4 h-1 rounded-sm mt-0.5"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 w-[168px]">
            <p className="text-xs text-gray-500 mb-2 font-medium">Text Color</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setColor(color).run();
                    setOpen(false);
                  }}
                  className="w-8 h-8 rounded hover:scale-110 transition-transform border border-white shadow-sm ring-offset-1 hover:ring-2 hover:ring-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
              <label className="text-xs text-gray-500 flex-shrink-0">Custom:</label>
              <input
                ref={inputRef}
                type="color"
                value={currentColor}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="h-6 w-10 cursor-pointer rounded border border-gray-200 p-0"
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                  setOpen(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors ml-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function HighlightPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const HIGHLIGHTS = [
    "#fef08a", "#bbf7d0", "#bfdbfe", "#fde68a",
    "#fecaca", "#e9d5ff", "#fed7aa", "#a7f3d0",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        title="Highlight"
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded hover:bg-gray-100 transition-colors",
          editor.isActive("highlight") ? "bg-yellow-100 text-yellow-700" : "text-gray-700"
        )}
      >
        <Highlighter className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5">
            <p className="text-xs text-gray-500 mb-2 font-medium">Highlight</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {HIGHLIGHTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setOpen(false);
                  }}
                  className="w-8 h-8 rounded hover:scale-110 transition-transform border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetHighlight().run();
                setOpen(false);
              }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors w-full text-center pt-1 border-t border-gray-100"
            >
              Remove highlight
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Link dialog ───────────────────────────────────────────────────────────────

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const isActive = editor.isActive("link");

  function applyLink() {
    if (!url.trim()) return;
    const href = url.startsWith("http") ? url : `https://${url}`;
    editor.chain().focus().setLink({ href, target: "_blank" }).run();
    setOpen(false);
    setUrl("");
  }

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => {
          if (isActive) {
            editor.chain().focus().unsetLink().run();
          } else {
            setUrl(editor.getAttributes("link").href ?? "");
            setOpen(true);
          }
        }}
        active={isActive}
        title={isActive ? "Remove link" : "Add link"}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[280px]">
            <p className="text-xs font-medium text-gray-700 mb-2">Insert Link</p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="https://example.com"
              autoFocus
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Image insert (upload or URL) ──────────────────────────────────────────────

function ImageButton({ editor }: { editor: Editor }) {
  const [open,      setOpen]      = useState(false);
  const [tab,       setTab]       = useState<"upload" | "url">("upload");
  const [url,       setUrl]       = useState("");
  const [altText,   setAltText]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function insertImage(src: string, alt?: string) {
    editor.chain().focus().setImage({ src, alt: alt ?? "" }).run();
    setOpen(false);
    setUrl("");
    setAltText("");
    setError("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      insertImage(data.url, altText || file.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setOpen((v) => !v)}
        active={open}
        title="Insert image"
      >
        <ImageIcon className="h-3.5 w-3.5" />
      </ToolbarButton>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onMouseDown={() => { setOpen(false); setError(""); }} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-[300px] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["upload", "url"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setTab(t); setError(""); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                    tab === t
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {t === "upload" ? <Upload className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                  {t === "upload" ? "Upload file" : "Paste URL"}
                </button>
              ))}
            </div>

            <div className="p-3 space-y-2.5">
              {/* Alt text (shared) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alt text (optional)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image"
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {tab === "upload" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Choose image…</>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center">JPEG, PNG, WebP, GIF, SVG · max 8 MB</p>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && url.trim()) insertImage(url.trim(), altText);
                        if (e.key === "Escape") setOpen(false);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      autoFocus={tab === "url"}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (url.trim()) insertImage(url.trim(), altText);
                    }}
                    disabled={!url.trim()}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    Insert image
                  </button>
                </>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main toolbar ──────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">

      {/* Text style */}
      <TextStyleDropdown editor={editor} />
      <ToolbarDivider />

      {/* Font family */}
      <FontFamilyDropdown editor={editor} />
      <ToolbarDivider />

      {/* Basic formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Color + highlight */}
      <ColorPicker editor={editor} />
      <HighlightPicker editor={editor} />

      <ToolbarDivider />

      {/* Text alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <LinkButton editor={editor} />

      {editor.isActive("link") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove link"
        >
          <Link2Off className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}

      <ImageButton editor={editor} />

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your page content here…",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rte-image" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-content tiptap-editor-content",
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "tiptap-editor border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow",
        className
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />

      {/* Word count */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
        <span>
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters
          &nbsp;·&nbsp;
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-gray-300">HTML · TipTap</span>
      </div>
    </div>
  );
}
