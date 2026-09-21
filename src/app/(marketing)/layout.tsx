import { prisma } from "@/lib/db";
import { LegalBanner } from "@/components/marketing/legal-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

// AuthorLoft's own Organization / WebSite structured data. Lives here (marketing pages only) rather than in the
// root layout, which also wraps every author site and was declaring each author page part of AuthorLoft's WebSite.
const PLATFORM_URL = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AuthorLoft",
  url: PLATFORM_URL,
  logo: `${PLATFORM_URL}/authorloft-logo.png`,
  description:
    "The all-in-one platform for independent authors. Sell books directly, grow your newsletter, and showcase your work — no coding required.",
  sameAs: [PLATFORM_URL],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AuthorLoft",
  url: PLATFORM_URL,
  description:
    "The all-in-one platform for independent authors to own their business, sell books directly, grow their audience, and track everything.",
  publisher: { "@type": "Organization", name: "AuthorLoft" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${PLATFORM_URL}/bookstore?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Fetch platform settings for legal-update banner
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { privacyUpdatedAt: true, termsUpdatedAt: true },
  }).catch(() => null);

  const privacyUpdatedAt = settings?.privacyUpdatedAt?.toISOString() ?? null;
  const termsUpdatedAt   = settings?.termsUpdatedAt?.toISOString()   ?? null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {children}
      <MarketingFooter />
      <LegalBanner privacyUpdatedAt={privacyUpdatedAt} termsUpdatedAt={termsUpdatedAt} />
    </>
  );
}
