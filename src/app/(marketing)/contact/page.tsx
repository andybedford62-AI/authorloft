import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | AuthorLoft",
  description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type:        "website",
    title:       "Contact Us | AuthorLoft",
    description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
    images:      [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Contact Us | AuthorLoft",
    description: "Get in touch with the AuthorLoft team. Questions about plans, your account, or anything else — we reply within one business day.",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
