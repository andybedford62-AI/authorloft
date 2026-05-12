import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const PLATFORM_URL = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const metadata: Metadata = {
  metadataBase: new URL(PLATFORM_URL),
  title: {
    default: "AuthorLoft — The Author Website Platform",
    template: "%s | AuthorLoft",
  },
  description:
    "Build your author website with AuthorLoft. Catalog management, digital book sales, newsletter capture, flip books, and more — no coding required.",
  icons: { icon: "/authorloft-logo.png" },
  openGraph: {
    type:        "website",
    siteName:    "AuthorLoft",
    title:       "AuthorLoft — The Author Website Platform",
    description: "Build your author website with AuthorLoft. Catalog management, digital book sales, newsletter capture, flip books, and more — no coding required.",
    url:         PLATFORM_URL,
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AuthorLoft — The Author Website Platform",
    description: "Build your author website with AuthorLoft. Catalog management, digital book sales, newsletter capture, flip books, and more — no coding required.",
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.variable} ${playfair.variable} ${inter.className} min-h-full`} suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
