"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, CheckCircle, AlertTriangle,
  Globe, Mail, User, Shield, ToggleLeft, CreditCard,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  tier: string;
  monthlyPriceCents: number;
};

type Author = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  slug: string;
  customDomain: string | null;
  bio: string | null;
  shortBio: string | null;
  tagline: string | null;
  contactEmail: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  planId: string | null;
};

interface Props {
  author: Author;
  plans: Plan[];
}

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const textareaClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none";

export function AuthorEditForm({ author, plans }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    name:         author.name,
    displayName:  author.displayName  ?? "",
    email:        author.email,
    slug:         author.slug,
    customDomain: author.customDomain ?? "",
    bio:          author.bio          ?? "",
    shortBio:     author.shortBio     ?? "",
    tagline:      author.tagline      ?? "",
    contactEmail: author.contactEmail ?? "",
    isActive:     author.isActive,
    isSuperAdmin: author.isSuperAdmin,
    planId:       author.planId       ?? "",
  });

  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<"idle" | "success" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    setErrMsg("");

    try {
      const res = await fetch(`/api/super-admin/authors/${author.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          displayName:  form.displayName  || null,
          customDomain: form.customDomain || null,
          bio:          form.bio          || null,
          shortBio:     form.shortBio     || null,
          tagline:      form.tagline      || null,
          contactEmail: form.contactEmail || null,
          planId:       form.planId       || null,
        }),
      });

      if (res.ok) {
        setStatus("success");
        router.refresh();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrMsg(d.error || "Could not save changes.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const TIER_COLORS: Record<string, string> = {
    FREE: "text-gray-500",
    STANDARD: "text-blue-600",
    PREMIUM: "text-purple-600",
  };

  return (
    <div className="space-y-5">

      {/* ── Identity ─────────────────────────────────────────────────── */}
      <Section title="Identity" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" hint="Legal / account name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Display name" hint="Shown publicly on the site (optional)">
            <input
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Same as full name if blank"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Tagline" hint="Short one-liner shown under the name on the author site">
          <input
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="e.g. Award-winning crime fiction author"
            className={inputClass}
          />
        </Field>
        <Field label="Short bio" hint="Used in cards and previews (1–2 sentences)">
          <textarea
            value={form.shortBio}
            onChange={(e) => set("shortBio", e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </Field>
        <Field label="Full bio" hint="Shown on the About page">
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={5}
            className={textareaClass}
          />
        </Field>
      </Section>

      {/* ── Contact & Access ─────────────────────────────────────────── */}
      <Section title="Contact & Login" icon={Mail}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Login email" hint="Used to sign in — must be unique">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Public contact email" hint="Shown on contact form (optional)">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              placeholder="hello@authorname.com"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* ── Domain & URL ─────────────────────────────────────────────── */}
      <Section title="Domain & URL" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Slug" hint="authorloft.com subdomain — must be unique, lowercase, no spaces">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">
                authorloft.com/
              </span>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
            </div>
          </Field>
          <Field label="Custom domain" hint="e.g. www.authorname.com — leave blank if not set">
            <input
              value={form.customDomain}
              onChange={(e) => set("customDomain", e.target.value.toLowerCase().trim())}
              placeholder="www.authorname.com"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* ── Plan assignment ──────────────────────────────────────────── */}
      <Section title="Plan" icon={CreditCard}>
        <Field label="Assigned plan" hint="Controls feature access and content limits">
          <select
            value={form.planId}
            onChange={(e) => set("planId", e.target.value)}
            className={inputClass}
          >
            <option value="">— No plan assigned —</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.tier}){plan.monthlyPriceCents > 0
                  ? ` — $${(plan.monthlyPriceCents / 100).toFixed(2)}/mo`
                  : " — Free"}
              </option>
            ))}
          </select>
          {form.planId && (() => {
            const selected = plans.find((p) => p.id === form.planId);
            return selected ? (
              <p className={`text-xs mt-1 font-medium ${TIER_COLORS[selected.tier] ?? "text-gray-500"}`}>
                {selected.tier} tier selected
              </p>
            ) : null;
          })()}
        </Field>
      </Section>

      {/* ── Account flags ────────────────────────────────────────────── */}
      <Section title="Account Flags" icon={Shield}>
        <div className="space-y-3">
          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Account active</p>
              <p className="text-xs text-gray-400">Inactive accounts cannot log in and their public site is hidden</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Super admin toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Super admin</p>
              <p className="text-xs text-gray-400">Grants access to the Super Admin area — use with caution</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isSuperAdmin}
              onClick={() => set("isSuperAdmin", !form.isSuperAdmin)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isSuperAdmin ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isSuperAdmin ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Section>

      {/* ── Save bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4">
        <div>
          {status === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Changes saved successfully
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" /> {errMsg}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="h-4 w-4" /> Save Changes</>
          }
        </button>
      </div>

    </div>
  );
}
