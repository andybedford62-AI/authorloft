import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the AuthorLoft team. We'd love to hear from you — questions, feedback, or partnership enquiries.",
  openGraph: {
    type:        "website",
    title:       "Contact AuthorLoft",
    description: "Get in touch with the AuthorLoft team. We'd love to hear from you.",
  },
  twitter: {
    card:        "summary",
    title:       "Contact AuthorLoft",
    description: "Get in touch with the AuthorLoft team. We'd love to hear from you.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
