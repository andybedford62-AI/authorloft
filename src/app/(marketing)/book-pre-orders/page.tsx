import { LANDING_PAGES } from "@/lib/landing-page-data";
import { landingPageMetadata } from "@/lib/landing-page-metadata";
import { LandingPage } from "@/components/marketing/landing-page";

const data = LANDING_PAGES["book-pre-orders"];

// Share image comes from SeoConfig (Super Admin), so re-render periodically instead of freezing it at build time.
export const revalidate = 60;

export const generateMetadata = () => landingPageMetadata(data.slug);

export default function Page() {
  return <LandingPage data={data} />;
}
