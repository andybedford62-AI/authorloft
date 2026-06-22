import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ConsentBanner } from "@/components/consent-banner";
import "./globals.css";

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
    default: "AuthorLoft — Own Your Author Business",
    template: "%s | AuthorLoft",
  },
  description:
    "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
  icons: { icon: "/authorloft-logo.png" },
  openGraph: {
    type:        "website",
    siteName:    "AuthorLoft",
    title:       "AuthorLoft — Own Your Author Business",
    description: "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
    url:         PLATFORM_URL,
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AuthorLoft — Own Your Author Business",
    description: "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AuthorLoft",
  url: PLATFORM_URL,
  description:
    "The all-in-one platform for independent authors to own their business, sell books directly, grow their audience, and track everything.",
  publisher: { "@type": "Organization", name: "AuthorLoft" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${PLATFORM_URL}/bookstore?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://q.stripe.com" />

        {/* Google Ads tag — raw script in <head> so Google's verifier detects it in initial HTML */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}', {'anonymize_ip': true});
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${inter.className} min-h-full`} suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
