import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { DEFAULT_PRIVACY } from "@/lib/legal-defaults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AuthorLoft",
  description: "How AuthorLoft collects, uses, and protects your personal information.",
};

function renderContent(text: string) {
  // Simple markdown-lite renderer: bold **text**, paragraphs on double newline
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    // Check if it's a heading (starts with **)
    if (para.startsWith("**") && para.endsWith("**") && para.indexOf("**", 2) === para.length - 2) {
      return (
        <h2 key={i} className="text-lg font-bold text-gray-900 mt-8 mb-2">
          {para.replace(/\*\*/g, "")}
        </h2>
      );
    }
    // Inline bold
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-gray-600 leading-relaxed">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="text-gray-800">{part.replace(/\*\*/g, "")}</strong>
            : part
        )}
      </p>
    );
  });
}

export default async function PrivacyPage() {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { privacyContent: true, privacyUpdatedAt: true },
  }).catch(() => null);

  const content    = settings?.privacyContent   || DEFAULT_PRIVACY;
  const updatedAt  = settings?.privacyUpdatedAt ?? null;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          {updatedAt && (
            <p className="text-sm text-gray-400 mt-2">
              Last updated:{" "}
              {new Date(updatedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="space-y-4 prose-slate max-w-none">
          {renderContent(content)}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-sm text-gray-400">
          <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service →</Link>
          <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
