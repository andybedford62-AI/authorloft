import { LANDING_PAGES } from "@/lib/landing-page-data";
import { landingPageMetadata } from "@/lib/landing-page-metadata";
import { LandingPage } from "@/components/marketing/landing-page";
import { MusicPlansSection } from "@/components/marketing/music-plans-section";

const data = LANDING_PAGES["for-musicians"];

export const generateMetadata = () => landingPageMetadata(data.slug);

export const revalidate = 60;

export default function Page() {
  return <LandingPage data={data} afterSections={<MusicPlansSection />} />;
}
