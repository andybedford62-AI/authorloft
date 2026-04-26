"use client";

import { useState, useRef } from "react";
import { Check, Loader2, Upload, X, User, Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Stat = { value: string; label: string };

type BrandingFormProps = {
  initial: {
    displayName: string;
    tagline: string;
    shortBio: string;
    bio: string;
    profileImageUrl: string;
    logoUrl: string;
    heroImageUrl: string;
    heroLayout: string;
    heroFeaturedBookId: string;
    linkedinUrl: string;
    youtubeUrl: string;
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    contactEmail: string;
    contactResponseTime: string;
    contactOpenTo: string;
    heroTitle: string;
    heroSubtitle: string;
    aboutStats: Stat[];
    showHeroBanner: boolean;
    credentials: string[];
  };
  books: { id: string; title: string; coverImageUrl: string | null }[];
  planTier?: string;
};

type Tab = "profile" | "about" | "hero" | "social";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "about",   label: "About Page" },
  { id: "hero",    label: "Hero" },
  { id: "social",  label: "Social & Contact" },
];

export function BrandingForm({ initial, books, planTier = "FREE" }: BrandingFormProps) {
  const isFree = planTier === "FREE";
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [shortBio, setShortBio] = useState(initial.shortBio);
  const [bio, setBio] = useState(initial.bio);
  const [profileImageUrl, setProfileImageUrl] = useState(initial.profileImageUrl);
  const [logoUrl, setLogoUrl]                   = useState(initial.logoUrl);
  const [uploadingLogo, setUploadingLogo]       = useState(false);
  const [logoError, setLogoError]               = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [heroImageUrl, setHeroImageUrl]         = useState(initial.heroImageUrl);
  const [heroLayout, setHeroLayout]             = useState(initial.heroLayout ?? "author-right");
  const [uploadingHero, setUploadingHero]       = useState(false);
  const [heroError, setHeroError]               = useState("");
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl);
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtubeUrl);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactResponseTime, setContactResponseTime] = useState(initial.contactResponseTime);
  const [contactOpenTo, setContactOpenTo] = useState(initial.contactOpenTo);
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [heroFeaturedBookId, setHeroFeaturedBookId] = useState(initial.heroFeaturedBookId);
  const [showHeroBanner, setShowHeroBanner] = useState(initial.showHeroBanner);
  const [aboutStats, setAboutStats] = useState<Stat[]>(initial.aboutStats);
  // Exactly 3 slots; empty string means "don't show"
  const [credentials, setCredentials] = useState<string[]>(
    [...initial.credentials, "", "", ""].slice(0, 3)
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textareaClass = "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload/profile", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setPhotoError(data.error || "Upload failed.");
      } else {
        setProfileImageUrl(data.url);
      }
    } catch {
      setPhotoError("Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    setProfileImageUrl("");
    await fetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileImageUrl: "" }),
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setLogoError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setLogoError(data.error || "Upload failed.");
      } else {
        setLogoUrl(data.url);
        // Persist immediately
        await fetch("/api/admin/branding", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoUrl: data.url }),
        });
      }
    } catch {
      setLogoError("Upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleRemoveLogo() {
    setLogoUrl("");
    await fetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: "" }),
    });
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setHeroError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/hero", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setHeroError(data.error || "Upload failed.");
      } else {
        setHeroImageUrl(data.url);
      }
    } catch {
      setHeroError("Upload failed. Please try again.");
    } finally {
      setUploadingHero(false);
      if (heroInputRef.current) heroInputRef.current.value = "";
    }
  }

  async function handleRemoveHero() {
    setHeroImageUrl("");
    await fetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroImageUrl: "" }),
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName, tagline, shortBio, bio,
        profileImageUrl, logoUrl, heroImageUrl, heroLayout,
        linkedinUrl, youtubeUrl, facebookUrl, twitterUrl, instagramUrl,
        contactEmail, contactResponseTime, contactOpenTo,
        heroTitle, heroSubtitle, showHeroBanner, heroFeaturedBookId,
        aboutStats, credentials,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not save changes.");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">

        {/* ══ PROFILE tab ══════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <>
            {/* Profile Photo */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Profile Photo</h2>
                <p className="text-sm text-gray-500 mt-0.5">Shown on your About page and throughout your site.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200 relative">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-block">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                      uploadingPhoto ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                      {uploadingPhoto
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        : <><Upload className="h-4 w-4" /> {profileImageUrl ? "Change Photo" : "Upload Photo"}</>
                      }
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                      className="sr-only" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                  {profileImageUrl && (
                    <button type="button" onClick={handleRemovePhoto}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors">
                      <X className="h-3 w-3" /> Remove photo
                    </button>
                  )}
                  <p className="text-xs text-gray-400">JPEG, PNG, or WebP · Max 5 MB</p>
                  {photoError && <p className="text-xs text-red-600">{photoError}</p>}
                </div>
              </div>
            </section>

            {/* Site Logo */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Site Logo</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Shown in your site navigation instead of your name. Leave empty to display your display name.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-32 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Site logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">No logo</span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-block">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                      uploadingLogo ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                      {uploadingLogo
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        : <><Upload className="h-4 w-4" /> {logoUrl ? "Change Logo" : "Upload Logo"}</>
                      }
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                  {logoUrl && (
                    <button type="button" onClick={handleRemoveLogo}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                      <X className="h-3 w-3" /> Remove logo
                    </button>
                  )}
                  <p className="text-xs text-gray-400">JPEG, PNG, WebP or SVG · Max 5 MB · Transparent PNG or SVG recommended</p>
                  {logoError && <p className="text-xs text-red-600">{logoError}</p>}
                </div>
              </div>
            </section>

            {/* Author Info */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Author Info</h2>
              <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                hint="Shown in your site header and hero section." />
              <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)}
                hint="Shown beneath your name (e.g. Author | Scuba Instructor)." />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Short Bio</label>
                <RichTextEditor value={shortBio} onChange={setShortBio} placeholder="A brief intro shown on your homepage…" />
                <p className="text-xs text-gray-400">Shown on the homepage. Keep it concise.</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Full Bio</label>
                <RichTextEditor value={bio} onChange={setBio} placeholder="Your full biography shown on the About page…" />
                <p className="text-xs text-gray-400">Displayed on your About page.</p>
              </div>
            </section>
          </>
        )}

        {/* ══ ABOUT PAGE tab ═══════════════════════════════════════════════ */}
        {activeTab === "about" && (
          <>
            {/* About Page Stats */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">About Page Stats</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Highlight facts about yourself on your About page. Your book count is always shown automatically — add as many custom stats as you like below.
                </p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-24">
                  <p className="text-sm font-semibold text-gray-400 italic">Auto</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Books Published <span className="text-xs text-gray-400">(calculated automatically)</span></p>
                </div>
              </div>
              <div className="space-y-2">
                {aboutStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={stat.value}
                      onChange={(e) => { const next = [...aboutStats]; next[i] = { ...next[i], value: e.target.value }; setAboutStats(next); }}
                      placeholder="e.g. 40+"
                      className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="text" value={stat.label}
                      onChange={(e) => { const next = [...aboutStats]; next[i] = { ...next[i], label: e.target.value }; setAboutStats(next); }}
                      placeholder="e.g. Years Diving"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <button type="button" onClick={() => setAboutStats(aboutStats.filter((_, idx) => idx !== i))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Remove stat">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setAboutStats([...aboutStats, { value: "", label: "" }])}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <Plus className="h-4 w-4" /> Add stat
              </button>
            </section>

            {/* Credential Badges */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Credential Badges</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Up to 3 short credential or affiliation labels displayed as pill badges in the About section of your homepage.
                  Leave a field blank to hide that badge.
                </p>
              </div>
              <div className="space-y-3">
                {credentials.map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 flex-shrink-0">Badge {i + 1}</span>
                    <input type="text" value={val} maxLength={40}
                      onChange={(e) => { const next = [...credentials]; next[i] = e.target.value; setCredentials(next); }}
                      placeholder={i === 0 ? "e.g. PADI Certified Instructor" : i === 1 ? "e.g. SDI / TDI Member" : "e.g. Software Systems Analyst"}
                      className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              {credentials.some((c) => c.trim()) && (
                <div className="pt-1">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {credentials.filter((c) => c.trim()).map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ══ HERO tab ═════════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Hero Banner</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  The full-width colored banner shown at the top of your homepage.
                </p>
              </div>
              <button type="button" role="switch" aria-checked={showHeroBanner}
                onClick={() => setShowHeroBanner(!showHeroBanner)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showHeroBanner ? "bg-blue-600" : "bg-gray-200"
                }`}>
                <span className="sr-only">Show hero banner</span>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showHeroBanner ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {!showHeroBanner && (
              <p className="text-sm text-gray-400 italic pt-1">
                Banner is hidden on your homepage. Toggle on to show it again.
              </p>
            )}

            {showHeroBanner && (
              <div className="space-y-5 pt-2">
                {/* Hero Photo */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hero Photo</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      This photo appears on the left or right panel of your homepage hero banner, fading softly into the background.
                      Use a portrait or head-and-shoulders shot. The full image will be shown — nothing is cropped.
                    </p>
                  </div>
                  {heroImageUrl && (
                    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center" style={{ minHeight: "200px", maxHeight: "280px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImageUrl} alt="Hero preview" className="max-w-full max-h-[280px] object-contain block" />
                      <p className="absolute bottom-2 left-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded">Preview</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="cursor-pointer inline-block">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                        uploadingHero ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                      }`}>
                        {uploadingHero
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                          : <><Upload className="h-4 w-4" /> {heroImageUrl ? "Change Hero Photo" : "Upload Hero Photo"}</>
                        }
                      </div>
                      <input ref={heroInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        className="sr-only" onChange={handleHeroUpload} disabled={uploadingHero} />
                    </label>
                    {heroImageUrl && (
                      <button type="button" onClick={handleRemoveHero}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                        <X className="h-3 w-3" /> Remove photo
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">JPEG, PNG or WebP · Max 10 MB</p>
                  {heroError && <p className="text-xs text-red-600">{heroError}</p>}
                  {!heroImageUrl && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                      No hero photo uploaded — the banner will show without a side portrait. Upload a photo to enable the author photo panel.
                    </p>
                  )}
                </div>

                {/* Banner Style */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Banner Style</p>
                  <p className="text-xs text-gray-400">Choose how your hero banner displays. Changes save instantly.</p>
                  <div className="flex gap-3">
                    {[
                      { value: "portrait",     label: "Classic",      paid: false },
                      { value: "author-left",  label: "Author Left",  paid: true  },
                      { value: "author-right", label: "Author Right", paid: true  },
                    ].map(({ value, label, paid }) => {
                      const locked = paid && isFree;
                      return (
                        <button key={value} type="button"
                          onClick={async () => {
                            if (locked) { window.location.href = "/admin/settings#billing"; return; }
                            setHeroLayout(value);
                            try {
                              await fetch("/api/admin/branding", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ heroLayout: value }),
                              });
                            } catch { /* silent */ }
                          }}
                          className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors relative overflow-hidden ${
                            locked
                              ? "border-gray-200 opacity-70 cursor-pointer"
                              : heroLayout === value
                              ? "border-blue-500 bg-blue-50 cursor-pointer"
                              : "border-gray-200 hover:border-gray-300 cursor-pointer"
                          }`}>
                          <div className="flex gap-1 w-full h-8">
                            {value === "author-left" && (
                              <>
                                <div className="w-2/5 rounded bg-gray-300 flex items-center justify-center text-[8px] text-gray-500">Photo</div>
                                <div className="flex-1 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">Book+Text</div>
                              </>
                            )}
                            {value === "author-right" && (
                              <>
                                <div className="flex-1 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">Book+Text</div>
                                <div className="w-2/5 rounded bg-gray-300 flex items-center justify-center text-[8px] text-gray-500">Photo</div>
                              </>
                            )}
                            {value === "portrait" && (
                              <div className="flex-1 rounded bg-gray-300 flex items-center justify-center text-[8px] text-gray-500 relative overflow-hidden">
                                <span>Full Photo</span>
                                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-400 flex items-center justify-center">
                                  <span className="text-[6px] text-white">name overlay</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${heroLayout === value && !locked ? "text-blue-600" : "text-gray-600"}`}>
                            {label}
                          </span>
                          {/* Lock overlay */}
                          {locked && (
                            <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-1.5">
                              <div className="w-8 h-8 rounded-full bg-gray-800/75 flex items-center justify-center">
                                <Lock className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-[10px] font-semibold text-white bg-gray-800/75 px-2 py-0.5 rounded-full">
                                Upgrade to unlock
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input label="Eyebrow Text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. Discover the Latest · Available Now"
                  hint="Small text above the book title in the hero banner." />
                <Input label="Hero Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="e.g. Thrilling underwater mysteries by A.P. Bedford" />

                {/* Featured Book Selector */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Featured Book</label>
                  <select
                    value={heroFeaturedBookId}
                    onChange={(e) => setHeroFeaturedBookId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">— Auto (uses book marked as Featured) —</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400">
                    The book cover shown in the hero banner. Leave blank to use whichever book is marked "Featured" in your Books list.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ══ SOCIAL & CONTACT tab ═════════════════════════════════════════ */}
        {activeTab === "social" && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Social & Contact</h2>
            <Input label="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
            <Input label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@..." />
            <Input label="Facebook URL" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." />
            <Input label="X / Twitter URL" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." />
            <Input label="Instagram URL" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="you@example.com" />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Response Time</label>
              <input type="text" value={contactResponseTime} onChange={(e) => setContactResponseTime(e.target.value)}
                placeholder="Typically within 24–48 hours"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <p className="text-xs text-gray-400">Shown on your public Contact page.</p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Open To</label>
              <textarea rows={2} value={contactOpenTo} onChange={(e) => setContactOpenTo(e.target.value)}
                placeholder="Reader questions, media inquiries, and book club discussions."
                className={textareaClass} />
              <p className="text-xs text-gray-400">Shown on your public Contact page.</p>
            </div>
          </section>
        )}

      </div>

      {/* ── Save bar ──────────────────────────────────────────────────────── */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
        )}
        <div className="flex items-center gap-3 pb-8">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              : saved
              ? <><Check className="h-4 w-4 mr-2" />Saved!</>
              : "Save Changes"}
          </Button>
          <p className="text-xs text-gray-400">Changes are reflected on your live site immediately.</p>
        </div>
      </div>
    </div>
  );
}
