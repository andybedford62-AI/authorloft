"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, Image, Globe } from "lucide-react";

const STORAGE_KEY = "al_onboarding_modal_dismissed";

const STEPS = [
  {
    icon: BookOpen,
    title: "Add your first book",
    description: "Give it a title, a description, and set your price. Takes about 2 minutes.",
  },
  {
    icon: Image,
    title: "Upload a cover (optional)",
    description: "A cover helps readers connect with your book — but you can always add it later.",
  },
  {
    icon: Globe,
    title: "Your site goes live instantly",
    description: "As soon as you save, your book appears on your public author site.",
  },
];

export function OnboardingModal({ show }: { show: boolean }) {
  const router  = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setOpen(true);
  }, [show]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function getStarted() {
    dismiss();
    router.push("/admin/books/new");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Welcome to AuthorLoft</p>
          <h2 className="text-2xl font-bold text-gray-900">Let's publish your first book</h2>
          <p className="text-sm text-gray-500 mt-1">It only takes a few minutes to go live.</p>
        </div>

        {/* Steps */}
        <ol className="space-y-4 mb-8">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <step.icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={getStarted}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Add My First Book →
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2 px-4 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
