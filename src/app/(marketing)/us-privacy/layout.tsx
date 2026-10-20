import type { Metadata } from "next";

// page.tsx is a client component and cannot export metadata, so it lives here.
export const metadata: Metadata = {
  title: "U.S. State Privacy Rights",
  description: "The privacy rights U.S. residents have under state laws, and how to ask AuthorLoft to access, correct, or delete your data.",
  alternates: { canonical: "/us-privacy" },
  openGraph: {
    type: "website",
    title: "U.S. State Privacy Rights | AuthorLoft",
    description: "The privacy rights U.S. residents have under state laws, and how to ask AuthorLoft to access, correct, or delete your data.",
    images: ["/og-home.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og-home.png"] },
};

export default function UsPrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
