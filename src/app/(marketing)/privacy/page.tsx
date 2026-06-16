import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { DEFAULT_PRIVACY } from "@/lib/legal-defaults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AuthorLoft collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
  openGraph: { type: "website", title: "Privacy Policy | AuthorLoft", description: "How AuthorLoft collects, uses, and protects your personal information." },
  twitter:    { card: "summary",  title: "Privacy Policy | AuthorLoft", description: "How AuthorLoft collects, uses, and protects your personal information." },
};

function renderContent(text: string) {
  // Simple markdown-lite renderer: bold **text**, paragraphs on double newline
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    // Check if it's a heading (starts with **)
    if (para.startsWith("**") && para.endsWith("**") && para.indexOf("**", 2) === para.length - 2) {
      return (
        <h2 key={i} className="text-lg font-bold text-[#1B2B47] mt-8 mb-2">
          {para.replace(/\*\*/g, "")}
        </h2>
      );
    }
    // Inline bold
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-[#5C6E89] leading-relaxed">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="text-[#1B2B47]">{part.replace(/\*\*/g, "")}</strong>
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
    <div className="min-h-screen bg-[#E8E5DD]">
      {/* Nav */}
      <header className="border-b border-[#DCDBD3] bg-[#E8E5DD] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={200} height={57} className="h-14 w-auto" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AuthorLoft home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B2B47]">Privacy Policy</h1>
          {updatedAt && (
            <p className="text-sm text-[#8993A4] mt-2">
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

        <div className="mt-12 pt-8 border-t border-[#DCDBD3] flex flex-wrap justify-between items-center gap-3 text-sm text-gray-400">
          <Link href="/terms"       className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Terms of Service →</Link>
          <Link href="/gdpr"        className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">GDPR &amp; Data Rights →</Link>
          <Link href="/us-privacy"  className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">U.S. State Privacy Rights →</Link>
          <Link href="/contact"     className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Contact us</Link>
        </div>

        {/* Register CTA */}
        <div className="mt-8 rounded-xl bg-[#F0EDE4] border border-[#DCDBD3] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5C6E89]">Ready to build your author site?</p>
          <Link href="/register" className="flex-shrink-0 bg-[#B8893D] text-[#0F1A2D] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D4AE6A] transition-colors">
            Create your free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
