"use client";

import { useState, useRef } from "react";
import { Check, Loader2, Upload, X, User, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Stat = { value: string; label: string };

type BrandingFormProps = {
  initial: {
    displayName: string;
    tagline: string;
    shortBio: string;
    bio: string;
    profileImageUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    contactEmail: string;
    heroTitle: string;
    heroSubtitle: string;
    aboutStats: Stat[];
    showHeroBanner: boolean;
    credentials: string[];
  };
};

export function BrandingForm({ initial }: BrandingFormProps) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [shortBio, setShortBio] = useState(initial.shortBio);
  const [bio, setBio] = useState(initial.bio);
  const [profileImageUrl, setProfileImageUrl] = useState(initial.profileImageUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl);
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtubeUrl);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
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
    // Persist the removal immediately
    await fetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileImageUrl: "" }),
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
        profileImageUrl,
        linkedinUrl, youtubeUrl, facebookUrl, twitterUrl, instagramUrl,
        contactEmail, heroTitle, heroSubtitle, showHeroBanner,
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
    <div className="space-y-8 max-w-2xl">

      {/* Profile Photo */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Profile Photo</h2>
          <p className="text-sm text-gray-500 mt-0.5">Shown on your About page and throughout your site.</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Preview */}
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

          {/* Controls */}
          <div className="space-y-2">
            <label className="cursor-pointer inline-block">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                uploadingPhoto
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                {uploadingPhoto
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  : <><Upload className="h-4 w-4" /> {profileImageUrl ? "Change Photo" : "Upload Photo"}</>
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>

            {profileImageUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" /> Remove photo
              </button>
            )}

            <p className="text-xs text-gray-400">JPEG, PNG, or WebP · Max 5 MB</p>
            {photoError && (
              <p className="text-xs text-red-600">{photoError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Author Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Author Info</h2>
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          hint="Shown in your site header and hero section."
        />
        <Input
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          hint="Shown beneath your name (e.g. Author | Scuba Instructor)."
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Short Bio</label>
          <textarea rows={3} value={shortBio} onChange={(e) => setShortBio(e.target.value)} className={textareaClass} />
          <p className="text-xs text-gray-400">Shown on the homepage. Keep it under 200 characters.</p>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Full Bio</label>
          <textarea rows={6} value={bio} onChange={(e) => setBio(e.target.value)} className={textareaClass} />
          <p className="text-xs text-gray-400">Displayed on your About page. Use blank lines to separate paragraphs.</p>
        </div>
      </section>

      {/* About Page Stats */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">About Page Stats</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Highlight facts about yourself on your About page. Your book count is always shown automatically — add up to 4 custom stats below.
          </p>
        </div>

        {/* Fixed: Books Published (auto) */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-24">
            <p className="text-sm font-semibold text-gray-400 italic">Auto</p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Books Published <span className="text-xs text-gray-400">(calculated automatically)</span></p>
          </div>
        </div>

        {/* Custom stats */}
        <div className="space-y-2">
          {aboutStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => {
                  const next = [...aboutStats];
                  next[i] = { ...next[i], value: e.target.value };
                  setAboutStats(next);
                }}
                placeholder="e.g. 40+"
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const next = [...aboutStats];
                  next[i] = { ...next[i], label: e.target.value };
                  setAboutStats(next);
                }}
                placeholder="e.g. Years Diving"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setAboutStats(aboutStats.filter((_, idx) => idx !== i))}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove stat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {aboutStats.length < 4 && (
          <button
            type="button"
            onClick={() => setAboutStats([...aboutStats, { value: "", label: "" }])}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add stat
          </button>
        )}
      </section>

      {/* Social Links */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Social Links</h2>
        <Input label="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
        <Input label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@..." />
        <Input label="Facebook URL" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." />
        <Input label="X / Twitter URL" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." />
        <Input label="Instagram URL" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
        <Input label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="you@example.com" />
      </section>

      {/* Hero Banner */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Hero Banner</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              The full-width colored banner shown at the top of your homepage.
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={showHeroBanner}
            onClick={() => setShowHeroBanner(!showHeroBanner)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showHeroBanner ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span className="sr-only">Show hero banner</span>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showHeroBanner ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {showHeroBanner && (
          <div className="space-y-4 pt-2">
            <Input label="Hero Title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. Dive Into Adventure" />
            <Input label="Hero Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="e.g. Thrilling underwater mysteries by A.P. Bedford" />
          </div>
        )}

        {!showHeroBanner && (
          <p className="text-sm text-gray-400 italic pt-1">
            Banner is hidden on your homepage. Toggle on to show it again.
          </p>
        )}
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
              <input
                type="text"
                value={val}
                maxLength={40}
                onChange={(e) => {
                  const next = [...credentials];
                  next[i] = e.target.value;
                  setCredentials(next);
                }}
                placeholder={
                  i === 0 ? "e.g. PADI Certified Instructor"
                  : i === 1 ? "e.g. SDI / TDI Member"
                  : "e.g. Software Systems Analyst"
                }
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        {/* Live preview */}
        {credentials.some((c) => c.trim()) && (
          <div className="pt-1">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <div className="flex flex-wrap gap-2">
              {credentials.filter((c) => c.trim()).map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Save */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
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
  );
}
