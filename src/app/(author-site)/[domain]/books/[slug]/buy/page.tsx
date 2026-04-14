import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, BookOpen, Film, Package, Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
import { formatCents } from "@/lib/utils";
import { BuyButton } from "@/components/author-site/buy-button";

// ── Format display helpers ────────────────────────────────────────────────────

const FORMAT_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  EBOOK:    { label: "eBook",          icon: <BookOpen className="h-4 w-4" />, color: "#2563eb", bg: "#eff6ff" },
  FLIPBOOK: { label: "Flip Book",      icon: <Film     className="h-4 w-4" />, color: "#7c3aed", bg: "#f5f3ff" },
  PRINT:    { label: "Print / Physical", icon: <Package className="h-4 w-4" />, color: "#059669", bg: "#ecfdf5" },
};

// ── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ item?: string }>;
}

export default async function BuyPage({ params, searchParams }: Props) {
  const { domain, slug } = await params;
  const { item: saleItemId } = await searchParams;

  // Resolve author from subdomain
  const author = await getAuthorByDomain(domain).catch(() => null);
  if (!author) notFound();

  const accentColor = author.accentColor || "#7B2D2D";

  // Load the book
  const book = await prisma.book.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    select: {
      id: true,
      title: true,
      subtitle: true,
      coverImageUrl: true,
      shortDescription: true,
      priceCents: true,
      directSalesEnabled: true,
      directSaleItems: {
        where: { isActive: true },
        select: { id: true, format: true, label: true, description: true, priceCents: true, fileKey: true },
      },
    },
  });

  if (!book) notFound();
  if (!book.directSalesEnabled) notFound();

  // Find the specific sale item (from ?item= query param)
  const saleItem = saleItemId
    ? book.directSaleItems.find((i) => i.id === saleItemId)
    : book.directSaleItems[0];

  if (!saleItem) notFound();

  const fmt = FORMAT_META[saleItem.format] ?? FORMAT_META.EBOOK;
  const isDigital = saleItem.format !== "PRINT";
  const hasFile = !!saleItem.fileKey;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Link
            href={`/books/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to book
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Book summary */}
          <div className="flex gap-4 p-6 border-b border-gray-100">
            {book.coverImageUrl && (
              <div className="flex-shrink-0 w-20 rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  width={80}
                  height={110}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                {author.displayName || author.name}
              </p>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{book.title}</h1>
              {book.subtitle && (
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{book.subtitle}</p>
              )}
              {book.shortDescription && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                  {book.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Purchase summary */}
          <div className="p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-800">Order summary</h2>

            {/* Item row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: fmt.bg, color: fmt.color }}
                >
                  {fmt.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{saleItem.label}</p>
                  {saleItem.description && (
                    <p className="text-xs text-gray-400">{saleItem.description}</p>
                  )}
                  {isDigital && (
                    <p className="text-xs text-gray-400">Instant digital download</p>
                  )}
                </div>
              </div>
              <span className="text-base font-bold text-gray-900">
                {formatCents(saleItem.priceCents)}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatCents(saleItem.priceCents)}</span>
            </div>

            {/* File not uploaded warning */}
            {isDigital && !hasFile && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                This item is not yet available for purchase — the download file hasn't been uploaded.
                Please check back soon.
              </div>
            )}

            {/* Checkout button */}
            {(!isDigital || hasFile) && (
              <BuyButton
                saleItemId={saleItem.id}
                label={`Pay ${formatCents(saleItem.priceCents)}`}
                accentColor={accentColor}
              />
            )}

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Lock className="h-3 w-3" />
              Secure payment via Stripe — we never see your card details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
