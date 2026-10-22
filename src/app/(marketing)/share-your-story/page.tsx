import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ShareStoryForm } from "./share-story-form";

// A form, not content: keep it out of search results (and out of the sitemap).
export const metadata: Metadata = {
  title: "Share Your AuthorLoft Story",
  description: "Tell us what AuthorLoft has done for your books, courses or music. A few sentences is plenty.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/share-your-story" },
};

export default function ShareYourStoryPage() {
  return (
    <>
      <MarketingNav />
      <ShareStoryForm />
    </>
  );
}
