"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, BookOpen, ChevronRight, ChevronLeft,
  Upload, CheckCircle, ExternalLink, Loader2, X,
} from "lucide-react";

function toSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 55);
  return base || `book-${Date.now()}`;
}

interface BioState {
  bio: string;
  tagline: string;
  contactEmail: string;
  profileFile: File | null;
  profilePreview: string | null;
}

interface BookState {
  title: string;
  description: string;
  coverFile: File | null;
  coverPreview: string | null;
}

export function OnboardingGuidedModal({
  show,
  authorSlug,
  onDismiss,
}: {
  show: boolean;
  authorSlug: string;
  onDismiss?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bio, setBio] = useState<BioState>({
    bio: "",
    tagline: "",
    contactEmail: "",
    profileFile: null,
    profilePreview: null,
  });

  const [book, setBook] = useState<BookState>({
    title: "",
    description: "",
    coverFile: null,
    coverPreview: null,
  });

  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const siteUrl = `https://${authorSlug}.authorloft.com`;

  // ── Image helpers ────────────────────────────────────────────────────────

  function onProfilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBio(p => ({ ...p, profileFile: file, profilePreview: URL.createObjectURL(file) }));
  }

  function onCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBook(p => ({ ...p, coverFile: file, coverPreview: URL.createObjectURL(file) }));
  }

  // ── Step navigation ──────────────────────────────────────────────────────

  function goNext() {
    if (!bio.bio.trim() || bio.bio.trim().length < 30) {
      setError("Please write at least 30 characters about yourself.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function goBack() {
    setError(null);
    setStep(1);
  }

  // ── Final publish ────────────────────────────────────────────────────────

  async function handlePublish() {
    if (!book.title.trim()) {
      setError("Book title is required.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      // 1. Upload profile image (if selected)
      let profileImageUrl: string | undefined;
      if (bio.profileFile) {
        const fd = new FormData();
        fd.append("file", bio.profileFile);
        const res = await fetch("/api/admin/upload/profile", { method: "POST", body: fd });
        if (res.ok) profileImageUrl = (await res.json()).url;
      }

      // 2. Save bio/profile data via existing branding endpoint
      const shortBio = bio.bio.trim().slice(0, 155);
      await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.bio.trim(),
          shortBio,
          tagline:      bio.tagline.trim()      || undefined,
          contactEmail: bio.contactEmail.trim() || undefined,
          ...(profileImageUrl ? { profileImageUrl } : {}),
        }),
      });

      // 3. Upload cover image (if selected)
      let coverImageUrl: string | undefined;
      if (book.coverFile) {
        const fd = new FormData();
        fd.append("file", book.coverFile);
        const res = await fetch("/api/admin/upload/cover", { method: "POST", body: fd });
        if (res.ok) coverImageUrl = (await res.json()).url;
      }

      // 4. Create book — also sets onboardingCompletedAt via existing API logic
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:         book.title.trim(),
          slug:          toSlug(book.title),
          description:   book.description.trim() || undefined,
          coverImageUrl: coverImageUrl            || undefined,
          isPublished:   true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create book. Please try again.");
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDone() {
    router.refresh();
  }

  // ── Step 1: Bio & Profile ─────────────────────────────────────────────────

  if (step === 1) {
    return (
      <Shell>
        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex items-start justify-between mb-0">
            <StepProgress current={1} total={2} />
            {onDismiss && (
              <button onClick={onDismiss} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Welcome to AuthorLoft
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Tell readers about yourself</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            This appears on your live author site right away.
          </p>

          {/* Profile photo */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => profileRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors flex-shrink-0"
                aria-label="Upload profile photo"
              >
                {bio.profilePreview ? (
                  <img src={bio.profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => profileRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {bio.profilePreview ? "Change photo" : "Upload photo"}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · max 5 MB</p>
              </div>
            </div>
            <input
              ref={profileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onProfilePick}
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About You <span className="text-red-500">*</span>
            </label>
            <textarea
              value={bio.bio}
              onChange={e => setBio(p => ({ ...p, bio: e.target.value }))}
              rows={4}
              maxLength={1000}
              placeholder="Tell readers who you are, what genre you write, and what makes your stories unique..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">Minimum 30 characters</p>
              <p className="text-xs text-gray-400">{bio.bio.length}/1000</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={bio.tagline}
              onChange={e => setBio(p => ({ ...p, tagline: e.target.value }))}
              maxLength={100}
              placeholder="e.g. Award-winning author of gripping thrillers"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={bio.contactEmail}
              onChange={e => setBio(p => ({ ...p, contactEmail: e.target.value }))}
              placeholder="readers@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Displayed on your contact page for reader enquiries.</p>
          </div>

          {error && <ErrorBanner message={error} />}

          <button
            onClick={goNext}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            Next: Add Your Book <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Shell>
    );
  }

  // ── Step 2: First Book ────────────────────────────────────────────────────

  if (step === 2) {
    return (
      <Shell>
        <div className="p-8">
          <div className="flex items-start justify-between mb-0">
            <StepProgress current={2} total={2} />
            {onDismiss && (
              <button onClick={onDismiss} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Almost there
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Add your first book</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            It will appear on your live site as soon as you publish.
          </p>

          {/* Book title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={book.title}
              onChange={e => setBook(p => ({ ...p, title: e.target.value }))}
              maxLength={200}
              placeholder="Enter your book title"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cover image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image <span className="text-gray-400 font-normal">(optional — you can add it later)</span>
            </label>
            <div
              onClick={() => coverRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {book.coverPreview ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={book.coverPreview} alt="Cover preview" className="max-h-40 rounded-lg shadow-sm" />
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload book cover</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
                </>
              )}
            </div>
            {book.coverPreview && (
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Change image
              </button>
            )}
            <input
              ref={coverRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onCoverPick}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={book.description}
              onChange={e => setBook(p => ({ ...p, description: e.target.value }))}
              rows={4}
              maxLength={2000}
              placeholder="A compelling summary to hook readers..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3">
            <button
              onClick={goBack}
              disabled={saving}
              className="py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl text-sm flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <>Publish My Site <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            You can add more books, update details, and upload files after publishing.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Step 3: Celebration ───────────────────────────────────────────────────

  return (
    <Shell>
      <div className="p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your author site is live!</h2>
        <p className="text-gray-500 text-sm mb-4">
          Readers can now discover you and your books at:
        </p>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm mb-8 bg-blue-50 px-4 py-2 rounded-lg break-all"
        >
          {siteUrl} <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        </a>

        <div className="flex flex-col gap-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            View My Site
          </a>
          <button
            onClick={handleDone}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Next steps (optional)</p>
          <ul className="space-y-2">
            {[
              { icon: BookOpen, text: "Add more books and upload your files" },
              { icon: User,     text: "Connect Stripe to sell books directly" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-gray-500">
                <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${done   ? "bg-green-500" : active ? "bg-blue-600" : "bg-gray-200"}`}
            >
              {done ? (
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              ) : (
                <span className={`text-xs font-bold ${active ? "text-white" : "text-gray-400"}`}>{n}</span>
              )}
            </div>
            {i < total - 1 && (
              <div className={`w-12 h-1 rounded-full ${done || active ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
      <span className="text-xs text-gray-400 ml-1">Step {current} of {total}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {message}
    </div>
  );
}
