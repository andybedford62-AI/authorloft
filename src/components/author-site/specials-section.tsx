import Image from "next/image";
import { ExternalLink, Clock } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { CopyCodeButton } from "@/components/author-site/copy-code-button";
import { formatCents } from "@/lib/utils";

interface DiscountCode {
  code: string;
  type: string;
  value: number;
  isActive: boolean;
}

interface Special {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  endsAt: Date | string | null;
  discountCode: DiscountCode | null;
}

interface SpecialsSectionProps {
  specials: Special[];
  accentColor: string;
}

/**
 * Highlighted "deals table at the entrance" section shown at the top of the
 * public Books page. Renders nothing when there are no active specials.
 */
export function SpecialsSection({ specials, accentColor }: SpecialsSectionProps) {
  if (specials.length === 0) return null;

  const now = new Date();

  return (
    <section
      id="specials"
      className="border-b border-gray-100 bg-gray-50/70 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-block h-6 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Current Specials
            </h2>
            <p className="text-sm text-gray-500">
              Limited-time deals, signed copies, bundles, and exclusive offers.
            </p>
          </div>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on larger screens */}
        <div className="flex gap-5 overflow-x-auto snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          {specials.map((special) => {
            const endsAt = special.endsAt ? new Date(special.endsAt) : null;
            const daysLeft = endsAt
              ? Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={special.id}
                className="snap-start min-w-[280px] sm:min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {special.imageUrl ? (
                  <div className="relative h-40 w-full bg-gray-100">
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
                        : `Ends ${endsAt!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 text-lg leading-snug">
                    {special.title}
                  </h3>

                  {special.description && (
                    <div
                      className="text-sm text-gray-500 leading-relaxed flex-1 rich-content"
                      dangerouslySetInnerHTML={{ __html: sanitize(special.description) }}
                    />
                  )}

                  {/* Discount code */}
                  {special.discountCode?.isActive && (
                    <div className="space-y-1.5 mt-auto">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Use code at checkout
                        {special.discountCode.type === "PERCENT"
                          ? ` — ${special.discountCode.value}% off`
                          : ` — ${formatCents(special.discountCode.value)} off`}
                      </p>
                      <CopyCodeButton code={special.discountCode.code} />
                    </div>
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
      </div>
    </section>
  );
}
