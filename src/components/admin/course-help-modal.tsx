"use client";

import { X, BookOpen, Layers, Video, Eye, DollarSign, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CourseHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: BookOpen,
    title: "How Courses Work",
    color: "text-blue-600 bg-blue-50",
    content:
      "A course is organized into Modules, and each module contains Lessons. Think of modules as chapters or weeks, and lessons as the individual topics within each. Readers purchase (or enroll for free in) your course and get a unique access link to view all lessons.",
  },
  {
    icon: Layers,
    title: "Modules & Lessons",
    color: "text-purple-600 bg-purple-50",
    content:
      "Each module has a title and optional description. Inside each module, add as many lessons as you need. A lesson can include a title, text content (HTML is supported for formatting), and an optional video. You need at least one module with a title to save your course.",
  },
  {
    icon: Video,
    title: "Video URLs",
    color: "text-red-600 bg-red-50",
    content:
      "Paste a YouTube or Vimeo link into the video field and it will be embedded in the lesson viewer for your students. You don't need to upload video files — just paste the share URL. The video field is optional; lessons can be text-only.",
  },
  {
    icon: Eye,
    title: "Free Preview Lessons",
    color: "text-green-600 bg-green-50",
    content:
      "Click the eye icon next to any lesson to mark it as a free preview. Preview lessons are visible to everyone — even without purchasing the course. Use this to give potential buyers a taste of your content and encourage them to enroll.",
  },
  {
    icon: DollarSign,
    title: "Pricing",
    color: "text-amber-600 bg-amber-50",
    content:
      "Set a price in dollars for paid courses — buyers will check out via Stripe. Set the price to $0 for a free course; readers will enter their email to enroll. Either way, you collect the reader's email for your subscriber list.",
  },
  {
    icon: Globe,
    title: "Publishing",
    color: "text-teal-600 bg-teal-50",
    content:
      "Check \"Published\" to make your course visible on your public site. Unpublished courses are saved as drafts — only you can see them in your admin dashboard. You can toggle this on and off at any time.",
  },
  {
    icon: Mail,
    title: "Course Access & Recovery",
    color: "text-indigo-600 bg-indigo-50",
    content:
      "When someone purchases or enrolls, they receive an email with a unique access link — no login required. If they lose the link, they can visit your site's Courses page and use the \"Lost your access link?\" form to have it resent to their email.",
  },
];

export function CourseHelpModal({ open, onClose }: CourseHelpModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">How Courses Work</h2>
            <p className="text-sm text-gray-500">Everything you need to know to create a great course</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {sections.map((section) => (
            <div key={section.title} className="flex gap-3">
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                <section.icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
          <Link
            href="/admin/help?article=ha_course_first"
            onClick={onClose}
            className="block text-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            View the full step-by-step guide in the Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
