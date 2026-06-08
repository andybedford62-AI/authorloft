import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { getOgImage } from "@/lib/seo-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("contact");
  return {
    title: "Contact Us | AuthorLoft",
    description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
    alternates: { canonical: "/contact" },
    openGraph: {
      type:        "website",
      title:       "Contact Us | AuthorLoft",
      description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
      images:      [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Contact Us | AuthorLoft",
      description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
      images:      [ogImage],
    },
  };
}

export default function ContactPage() {
  return (
    <>
      <MarketingNav />
      <ContactForm />
    </>
  );
}
