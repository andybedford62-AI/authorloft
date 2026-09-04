"use client";

import { X, Music, Link2, Download, ImageIcon, Globe, ListMusic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MusicHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: Music,
    title: "How Music Lists Work",
    color: "text-blue-600 bg-blue-50",
    content:
      "A music list is like an album or playlist page on your own site — a set of tracks, each one linking out to where it actually lives (YouTube, Spotify, Suno, etc.). Nothing is uploaded or streamed through AuthorLoft; you're just organizing and sharing links you already have.",
  },
  {
    icon: Link2,
    title: "Adding Tracks",
    color: "text-purple-600 bg-purple-50",
    content:
      "Paste a public link to each track. YouTube and Spotify links play inline right on your site; other links (like Suno) open in a new tab for the listener. Leave the title blank and we'll pull it from the linked page for you.",
  },
  {
    icon: Download,
    title: "Importing from YouTube",
    color: "text-red-600 bg-red-50",
    content:
      "Already have a YouTube playlist? Paste the playlist URL on the Import tab and every video in it gets added as a track automatically — no need to paste links one at a time.",
  },
  {
    icon: ImageIcon,
    title: "Cover Image & Featured",
    color: "text-amber-600 bg-amber-50",
    content:
      "Add a cover image so your list stands out on your Music page. Mark one list as Featured to show it as the hero highlight when your homepage focus is set to Music — only one list can be featured at a time.",
  },
  {
    icon: Globe,
    title: "Publishing",
    color: "text-teal-600 bg-teal-50",
    content:
      "Check \"Published\" to make the list visible on your public Music page. Unpublished lists stay as private drafts only you can see in your admin dashboard — you can toggle this on and off at any time.",
  },
  {
    icon: ListMusic,
    title: "Track & List Limits",
    color: "text-indigo-600 bg-indigo-50",
    content:
      "Free plans include up to 5 lists with 15 tracks each; Standard goes up to 20 lists with 50 tracks each; Premium is unlimited. Upgrade anytime from Settings if you need more room.",
  },
];

export function MusicHelpModal({ open, onClose }: MusicHelpModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">How Music Lists Work</h2>
            <p className="text-sm text-gray-500">Everything you need to know to add your first list</p>
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
            href="/admin/help?article=ha_music_first"
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
