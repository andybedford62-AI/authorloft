import Link from "next/link";

import { BookOpen, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { DEFAULT_TERMS } from "@/lib/legal-defaults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions that govern your use of AuthorLoft.",
  alternates: { canonical: "/terms" },
  openGraph: { type: "website", title: "Terms of Service | AuthorLoft", description: "The terms and conditions that govern your use of AuthorLoft." },
  twitter:    { card: "summary",  title: "Terms of Service | AuthorLoft", description: "The terms and conditions that govern your use of AuthorLoft." },
};

function renderContent(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    if (para.startsWith("**") && para.endsWith("**") && para.indexOf("**", 2) === para.length - 2) {
      return (
        <h2 key={i} className="text-lg font-bold text-[#1B2B47] mt-8 mb-2">
          {para.replace(/\*\*/g, "")}
        </h2>
      );
    }
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

export default async function TermsPage() {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { termsContent: true, termsUpdatedAt: true },
  }).catch(() => null);

  const content   = settings?.termsContent   || DEFAULT_TERMS;
  const updatedAt = settings?.termsUpdatedAt ?? null;

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      {/* Nav */}
      <header className="border-b border-[#DCDBD3] bg-[#E8E5DD] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 260 38" width={200} height={34} aria-label="AuthorLoft" role="img">
              <text x="0" y="30" style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
                <tspan fill="#B8893D">Author</tspan><tspan fill="#1B2B47">Loft</tspan>
              </text>
            </svg>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AuthorLoft home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B2B47]">Terms of Service</h1>
          {updatedAt && (
            <p className="text-sm text-[#8993A4] mt-2">
              Last updated:{" "}
              {new Date(updatedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="space-y-4 max-w-none">
          {renderContent(content)}
        </div>

        <div className="mt-12 pt-8 border-t border-[#DCDBD3] flex justify-between items-center text-sm text-gray-400">
          <Link href="/privacy" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">← Privacy Policy</Link>
          <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Contact us</Link>
        </div>

        {/* Register CTA */}
        <div className="mt-8 rounded-xl bg-[#F0EDE4] border border-[#DCDBD3] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5C6E89]">Ready to own your author business?</p>
          <Link href="/register" className="flex-shrink-0 bg-[#B8893D] text-[#0F1A2D] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D4AE6A] transition-colors">
            Create your free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
