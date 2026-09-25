import { LANDING_PAGES } from "@/lib/landing-page-data";
import { landingPageMetadata } from "@/lib/landing-page-metadata";
import { LandingPage } from "@/components/marketing/landing-page";

const data = LANDING_PAGES["book-pre-orders"];

export const generateMetadata = () => landingPageMetadata(data.slug);

export default function Page() {
  return <LandingPage data={data} />;
}
