// Minimal Template — "Books First" layout.
// Slim author header → full books catalog → series → compact bio → newsletter → contact
// No hero banner — the catalog leads, the author follows.

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen, Mail } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { NewsletterInlineForm } from "@/components/author-site/newsletter-inline-form";
import { accentAsTextOn } from "@/lib/color-contrast";
import type { HomeTemplateProps } from "./types";

export function MinimalTemplate({ author, books, series }: HomeTemplateProps) {
  const accentColor = author.accentColor;
  const authorName  = author.displayName || author.name;
  const firstName   = authorName.split(" ")[0];
  // Accent painted as TEXT needs a contrast floor -- this template's surfaces
  // are white or a near-white accent tint. Unchanged when it already passes.
  const accentText  = accentAsTextOn(accentColor, "#ffffff");

  // Show up to 6 books in the catalog grid
  const displayBooks = books.slice(0, 6);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── 1. Slim Author Header (replaces hero banner) ──────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-5">

            {/* Small profile photo */}
            {author.profileImageUrl ? (
              <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden relative ring-2" style={{ "--tw-ring-color": accentColor + "50" } as React.CSSProperties}>
                <Image src={author.profileImageUrl} alt={authorName} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {authorName[0]}
              </div>
            )}

            {/* Name + tagline */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 font-heading truncate">{authorName}</h1>
              {author.tagline && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{author.tagline}</p>
              )}
            </div>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
              <Link
                href="/books"
                className="text-sm font-semibold px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: accentColor }}
              >
                All Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Books Catalog (leads the page) ────────────────────────────── */}
      <section className="py-14" style={{ backgroundColor: accentColor + "1f" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentText }}>
                The Collection
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading tracking-tight">Books</h2>
            </div>
            {books.length > 6 && (
              <Link
                href="/books"
                className="text-sm font-semibold flex items-center gap-1 hover:opacity-75 transition-opacity"
                style={{ color: accentText }}
              >
                View all {books.length} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* 3-column grid showing up to 6 books */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8 max-w-4xl mx-auto">
            {displayBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.slug}`} className="group space-y-2.5">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 relative shadow group-hover:shadow-lg transition-shadow duration-300">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  {(book.caption || book.isPreOrder) && (
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white shadow"
                      style={{ backgroundColor: accentColor }}
                    >
                      {book.caption || "Coming Soon"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:underline">
                    {book.title}
                  </p>
                  {book.series && (
                    <p className="text-xs mt-0.5 font-medium" style={{ color: accentText }}>
                      {book.series.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Series ────────────────────────────────────────────────────── */}
      {series.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-7 rounded-full" style={{ backgroundColor: accentColor }} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading">Series</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200"
                  style={{ borderLeftWidth: "3px", borderLeftColor: accentColor }}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 group-hover:text-[var(--accent)] transition-colors leading-snug text-sm">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">{s.books.length} book{s.books.length !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Compact Author Bio ─────────────────────────────────────────── */}
      <section className="py-12 border-t border-gray-100" style={{ backgroundColor: accentColor + "14" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-heading">About {authorName}</h2>
          </div>
          <div
            className="text-gray-600 leading-relaxed text-sm rich-content"
            dangerouslySetInnerHTML={{ __html: sanitize(author.shortBio || "<p>Author bio coming soon.</p>") }}
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: accentText }}
            >
              Full biography <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: accentText }}
            >
              <Mail className="h-3.5 w-3.5" /> Email {firstName}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Newsletter ────────────────────────────────────────────────── */}
      {/* Deliberately the most restrained of the four -- single column at the
          bio's width, reusing the accent-bar heading motif, since this
          template's whole premise is restraint. */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Letters from {firstName}
            </h2>
          </div>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            New releases and reading recommendations, straight to your inbox.
          </p>
          <NewsletterInlineForm
            authorId={author.id}
            accentColor={accentColor}
            tone="light"
          />
        </div>
      </section>

      {/* ── 6. Contact CTA ───────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-gray-900 font-semibold">Get in Touch</p>
            <p className="text-gray-500 text-sm mt-0.5">Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button className="text-white hover:opacity-90" style={{ backgroundColor: accentColor }}>
              Contact {authorName}
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
