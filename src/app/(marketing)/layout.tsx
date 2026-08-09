import { prisma } from "@/lib/db";
import { LegalBanner } from "@/components/marketing/legal-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

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
      {children}
      <MarketingFooter />
      <LegalBanner privacyUpdatedAt={privacyUpdatedAt} termsUpdatedAt={termsUpdatedAt} />
    </>
  );
}
