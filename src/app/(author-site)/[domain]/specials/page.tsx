import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Clock } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { Button } from "@/components/ui/button";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";

export default async function SpecialsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const now = new Date();

  const specials = await prisma.special.findMany({
    where: {
      authorId: author.id,
      isActive: true,
      OR: [
        { endsAt: null },
        { endsAt: { gt: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>

      <PageBanner
        label="Promotions & Offers"
        title="Specials"
        subtitle={`Limited-time deals, signed copies, bundles, and exclusive offers from ${author.displayName || author.name}.`}
      />

      {/* ── Specials Grid ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {specials.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-500">No active specials right now</h2>
            <p className="text-gray-400 mt-2 mb-8 max-w-sm mx-auto">
              Check back soon — new offers and promotions are added regularly.
            </p>
            <Link href="/books">
              <Button variant="outline">Browse the Full Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((special) => {
              const hasExpiry = special.endsAt !== null;
              const daysLeft = hasExpiry
                ? Math.ceil((new Date(special.endsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={special.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  {special.imageUrl ? (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={special.imageUrl}
                        alt={special.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-3 w-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {/* Expiry badge */}
                    {daysLeft !== null && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
                        <Clock className="h-3 w-3" />
                        {daysLeft <= 1
                          ? "Ends today!"
                          : daysLeft <= 7
                          ? `${daysLeft} days left`
                          : `Ends ${new Date(special.endsAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </div>
                    )}

                    <h2 className="font-bold text-gray-900 text-lg leading-snug">
                      {special.title}
                    </h2>

                    {special.description && (
                      <div
                        className="text-sm text-gray-500 leading-relaxed flex-1 rich-content"
                        dangerouslySetInnerHTML={{ __html: special.description }}
                      />
                    )}

                    {/* CTA */}
                    {special.ctaUrl && (
                      <a
                        href={special.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto"
                      >
                        <Button className="w-full" style={{ backgroundColor: accentColor }}>
                          {special.ctaLabel || "Get This Deal"}
                          <ExternalLink className="h-3.5 w-3.5 ml-2" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Newsletter CTA ───────────────────────────────────────────── */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Never miss a deal</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Subscribe to the newsletter to get new specials and offers delivered straight to your inbox.
          </p>
          <Link href="/#newsletter">
            <Button size="lg">Subscribe for Updates</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
