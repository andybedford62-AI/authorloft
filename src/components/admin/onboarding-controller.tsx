"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, User, ArrowRight, PlayCircle } from "lucide-react";
import { OnboardingGuidedModal } from "./onboarding-guided-modal";

const DISMISSED_KEY = "al_onboarding_dismissed";

export function OnboardingController({
  authorSlug,
  hasBio,
  hasBook,
}: {
  authorSlug: string;
  hasBio: boolean;
  hasBook: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  // Read localStorage only after mount (SSR-safe)
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setModalOpen(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setModalOpen(false);
  }

  const incompleteTasks = [
    !hasBio  && { label: "Complete your author bio and profile photo", href: "/admin/branding",   icon: User },
    !hasBook && { label: "Add your first book",                        href: "/admin/books/new",  icon: BookOpen },
  ].filter(Boolean) as { label: string; href: string; icon: React.ElementType }[];

  return (
    <>
      {/* Guided modal — shown until dismissed or completed */}
      <OnboardingGuidedModal
        show={modalOpen}
        authorSlug={authorSlug}
        onDismiss={handleDismiss}
      />

      {/* Checklist shown when modal is dismissed but setup not finished */}
      {!modalOpen && incompleteTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-0.5">Finish setting up your author site</h2>
              <p className="text-sm text-blue-700 mb-4">
                Complete these steps so readers see a full profile and book when they visit your site.
              </p>
              <ul className="space-y-2.5">
                {incompleteTasks.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 text-sm text-blue-800 hover:text-blue-900 group"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3 w-3 text-blue-400" />
                      </div>
                      <span className="flex-1">{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Resume Setup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
